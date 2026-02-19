import tkinter as tk
import json
import os

KEY_LABEL_MAP = {
    "exit_poll_final_percentage_respect_condition": "percentage to end respect condition exit poll (only when exit_poll_real_time_voting is false)",
    "exit_poll_final_percentage_nonrespect_condition": "percentage to end non respect condition exit poll (only when exit_poll_real_time_voting is false)"
}

class TkinterWindow:
    def __init__(self, parent):
        self.current_directory = os.path.dirname(os.path.realpath(__file__))
        self.json_filepath = os.path.join(self.current_directory, "../../chatroom_configuration.json")

        self.root = tk.Toplevel(parent)
        self.root.grid_columnconfigure(0, weight=0)
        self.root.grid_columnconfigure(1, weight=1)
        self.root.title("JSON Editor")

        self.widgets = {}
        self.data = self.load_json()

        vcmd = (self.root.register(self.validate_int), "%P")

        for i, (key, value) in enumerate(self.data.items()):
            if key == "supported_languages":
                continue

            key_label = key

            if key in KEY_LABEL_MAP:
                key_label = KEY_LABEL_MAP[key]
            
            tk.Label(self.root, text=key_label, anchor="w").grid(row=i, column=0, padx=5, pady=5)
            
            if isinstance(value, bool):
                var = tk.BooleanVar(value=value)
                cb = tk.Checkbutton(self.root, variable=var)
                cb.grid(row=i, column=1, padx=5, pady=5, sticky="w")
                self.widgets[key] = var

            elif key == "current_language" in self.data:
                var = tk.StringVar(value=value)
                self.current_lang_var = var
                self.current_lang_option = tk.OptionMenu(self.root, var, *self.data["supported_languages"])
                self.current_lang_option.grid(row=i, column=1, padx=5, pady=5, sticky="w")
                entry = tk.Entry(self.root, validate="key", validatecommand=vcmd)
                self.widgets[key] = var

            else:
                entry = tk.Entry(self.root)
                entry.insert(0, str(value))
                entry.grid(row=i, column=1, padx=5, pady=5, sticky="ew")
                entry.bind("<Control-a>", self.select_all)
                entry.bind("<Control-A>", self.select_all)
                entry.bind("<<Paste>>", self.custom_paste)
                self.widgets[key] = entry

        tk.Button(self.root, text="Save", command=self.save).grid(
            row=len(self.data), column=0, columnspan=2, pady=15
        )

        tk.Button(self.root, text="Cancel", command=self.exit).grid(
            row=len(self.data)+1, column=0, columnspan=2, pady=5
        )

    def validate_int(self, value):
        return value.isdigit() or value == ""

    def load_json(self):
        with open(self.json_filepath, "r") as f:
            return json.load(f)

    def save(self):
        for key, widget in self.widgets.items():
            value = self.data[key]
            if isinstance(value, bool):
                self.data[key] = widget.get()
            elif key == "current_language":
                self.data[key] = widget.get()
            elif isinstance(value, int):
                try:
                    self.data[key] = int(widget.get())
                except:
                    pass
            else:
                self.data[key] = widget.get()

        with open(self.json_filepath, "w") as f:
            json.dump(self.data, f, indent=4)

        self.root.destroy()
 
    def exit(self):
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

def configureVariables(main_window):
    editor = TkinterWindow(main_window)
    main_window.wait_window(editor.root)
