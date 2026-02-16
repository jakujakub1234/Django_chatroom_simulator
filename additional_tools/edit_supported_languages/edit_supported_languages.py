import tkinter as tk
import json
import os

class TkinterWindow:
    def __init__(self, parent):
        self.current_directory = os.path.dirname(os.path.realpath(__file__))
        self.json_filepath = os.path.join(self.current_directory, "../../chatroom_configuration.json")

        self.load_json()

        self.root = tk.Toplevel(parent)
        self.root.title("Supported Languages Editor")
        self.root.geometry("300x300")

        tk.Label(self.root, text="Supported Languages:").pack(anchor="w", padx=10, pady=(10,0))

        self.listbox = tk.Listbox(self.root)
        self.listbox.pack(padx=10, pady=5, fill="both", expand=True)
        self.refresh_listbox()

        add_frame = tk.Frame(self.root)
        add_frame.pack(padx=10, pady=5, fill="x")
        self.new_lang_entry = tk.Entry(add_frame)
        self.new_lang_entry.pack(side="left", fill="x", expand=True)
        add_btn = tk.Button(add_frame, text="Add", command=self.add_language)
        add_btn.pack(side="left", padx=5)

        remove_btn = tk.Button(self.root, text="Remove Selected", command=self.remove_selected)
        remove_btn.pack(padx=10, pady=5, fill="x")

        close_btn = tk.Button(self.root, text="Close", command=self.root.destroy)
        close_btn.pack(padx=10, pady=10, fill="x")

    def load_json(self):
        with open(self.json_filepath, "r") as f:
            self.data = json.load(f)

    def save_json(self):
        with open(self.json_filepath, "w") as f:
            json.dump(self.data, f, indent=4)

    def refresh_listbox(self):
        self.listbox.delete(0, "end")
        for lang in self.data["supported_languages"]:
            self.listbox.insert("end", lang)

    def add_language(self):
        new_lang = self.new_lang_entry.get().strip()
        if new_lang and new_lang not in self.data["supported_languages"]:
            self.data["supported_languages"].append(new_lang)
            self.save_json()
            self.refresh_listbox()
        self.new_lang_entry.delete(0, "end")

    def remove_selected(self):
        selected = self.listbox.curselection()
        if not selected:
            return
        for index in reversed(selected):
            lang = self.listbox.get(index)
            self.data["supported_languages"].remove(lang)
        self.save_json()
        self.refresh_listbox()


def editSupportedLanguages(main_window):
    editor = TkinterWindow(main_window)
    main_window.wait_window(editor.root)
