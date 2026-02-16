import tkinter as tk
import yaml
import os
import shutil

class TkinterWindow:
    def __init__(self, parent):
        self.current_directory = os.path.dirname(os.path.realpath(__file__))
        self.secrets_filepath = self.current_directory + "/../../secrets.yaml"
        
        self.root = tk.Toplevel(parent)
        self.root.title("Secrets editor")

        self.entries = {}

        self.data = self.load_yaml()

        for i, (key, value) in enumerate(self.data.items()):
            tk.Label(self.root, text=key, anchor="w", width=20).grid(row=i, column=0, padx=5, pady=5)

            entry = tk.Entry(self.root, width=50)
            entry.insert(0, value)
            entry.grid(row=i, column=1, padx=5, pady=5)

            entry.bind("<Control-a>", self.select_all)
            entry.bind("<Control-A>", self.select_all)
            entry.bind("<<Paste>>", self.custom_paste)

            self.entries[key] = entry

        tk.Button(self.root, text="Save", command=self.save).grid(
            row=len(self.data), column=0, columnspan=2, pady=15
        )

        tk.Button(self.root, text="Cancel", command=self.exit).grid(
            row=len(self.data), column=1, columnspan=2, pady=15
        )

    def load_yaml(self):
        if not os.path.isfile(self.secrets_filepath):
            print("Secrets.yaml don't exists, copying secrets_example.yaml")

            if not os.path.isfile(self.current_directory + "/../../secrets_example.yaml"):
                print("ERROR: secrets_example.yaml not found")
                self.root.destroy()
                return

            shutil.copy2(self.current_directory + "/../../secrets_example.yaml", self.secrets_filepath)

        with open(self.secrets_filepath, "r") as f:
            return yaml.safe_load(f)

    def exit(self):
        self.root.destroy()

    def save(self):
        for key in self.entries:
            self.data[key] = self.entries[key].get()

        with open(self.secrets_filepath, "w") as f:
            yaml.dump(self.data, f, sort_keys=False)

        self.root.destroy()

    def select_all(self, event):
        event.widget.select_range(0, 'end')
        event.widget.icursor('end')
        return "break"
    
    def custom_paste(self, event):
        try:
            event.widget.delete("sel.first", "sel.last")
        except:
            pass
        event.widget.insert("insert", event.widget.clipboard_get())
        return "break"

def configureSecrets(main_window):
    tkinter_window = TkinterWindow(main_window)

    main_window.wait_window(tkinter_window.root)
