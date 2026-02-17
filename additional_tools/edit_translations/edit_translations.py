import tkinter as tk
from tkinter import messagebox
import json
import os

class TkinterWindow:
    def __init__(self, parent, languages_dir):
        self.languages_dir = languages_dir
        self.root = tk.Toplevel(parent)
        self.root.title("Translation Editor")

        tk.Label(self.root, text="Select language to edit:").pack(padx=10, pady=(10, 5))

        self.buttons_frame = tk.Frame(self.root)
        self.buttons_frame.pack(padx=10, pady=5, fill="x")

        self.language_files = {}
        for filename in os.listdir(languages_dir):
            if filename.endswith(".json"):
                lang_code = filename[:-5]
                self.language_files[lang_code] = os.path.join(languages_dir, filename)

        for lang, filepath in self.language_files.items():
            btn = tk.Button(
                self.buttons_frame, text=lang.upper(), width=15,
                command=lambda f=filepath, l=lang: self.open_language_window(f, l)
            )
            btn.pack(pady=2)

    def open_language_window(self, filepath, lang):
        editor_win = tk.Toplevel(self.root)
        editor_win.title(f"Editing {lang.upper()}")
        #editor_win.geometry("700x600")

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load {filepath}:\n{e}")
            editor_win.destroy()
            return

        canvas = tk.Canvas(editor_win)
        scrollbar = tk.Scrollbar(editor_win, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        self.entries = {}

        for i, (key, value) in enumerate(self.data.items()):
            tk.Label(scrollable_frame, text=key, anchor="w", width=30).grid(row=i, column=0, padx=5, pady=2, sticky="w")

            entry = tk.Entry(scrollable_frame, width=60)
            entry.insert(0, value)
            entry.grid(row=i, column=1, padx=5, pady=2, sticky="w")

            entry.bind("<Control-a>", self.select_all)
            entry.bind("<Control-A>", self.select_all)
            entry.bind("<<Paste>>", self.custom_paste)

            self.entries[key] = entry

        save_btn = tk.Button(editor_win, text="Save", command=lambda: self.save_file(filepath))
        save_btn.pack(pady=5)

    def save_file(self, filepath):
        for key, entry in self.entries.items():
            self.data[key] = entry.get()

        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=4)
            messagebox.showinfo("Saved", f"{os.path.basename(filepath)} saved successfully!")
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save file:\n{e}")

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

def editTranslations(main_window):
    languages_folder = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../../static/translations")
    editor = TkinterWindow(main_window, languages_folder)
    main_window.wait_window(editor.root)
