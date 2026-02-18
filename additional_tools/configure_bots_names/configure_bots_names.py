import tkinter as tk
from tkinter import messagebox
from tkinter import ttk
import json
import os

class TkinterWindow:
    def __init__(self, parent, languages_dir):
        self.languages_dir = languages_dir
        self.root = tk.Toplevel(parent)
        self.root.title("Edit bots names and lobby times")

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
        self.editor_win = tk.Toplevel(self.root)
        self.editor_win.geometry("1200x500")
        self.editor_win.title(f"Editing {lang.upper()}")

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load {filepath}:\n{e}", parent=self.root)
            self.editor_win.destroy()
            return

        canvas = tk.Canvas(self.editor_win)
        scrollbar = tk.Scrollbar(self.editor_win, orient="vertical", command=canvas.yview)
        scrollable_frame = tk.Frame(canvas)

        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )

        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)

        canvas.pack(side="left", fill="both", expand=True)
        scrollbar.pack(side="right", fill="y")

        self.bots_names = []
        self.bots_lobby_times = []

        for i, (key, value) in enumerate(self.data.items()):
            if key == "bots_nicks":
                self.bots_names = value.split(";")
            
            if key == "bots_lobby_times_to_appear":
                self.bots_lobby_times = value.split(";")

        tk.Label(scrollable_frame, text="Edit values by double clicking on it. First bot will always be loaded before user.").pack(padx=10, pady=(10, 5))

        self.tree = ttk.Treeview(scrollable_frame, columns=("Nick", "Seconds to load to lobby"), show="headings")
        self.tree.heading("Nick", text="Nick")
        self.tree.heading("Seconds to load to lobby", text="Seconds to load to lobby")
        self.tree.pack(fill="both", expand=True, padx=10, pady=10)

        self.tree.bind("<Double-1>", self.on_double_click)

        btn_frame = tk.Frame(scrollable_frame)
        btn_frame.pack(pady=5)

        tk.Button(btn_frame, text="Add", command=self.add_item).pack(side="left", padx=5)
        tk.Button(btn_frame, text="Remove", command=self.remove_item).pack(side="left", padx=5)

        tk.Button(btn_frame, text="Save", command=lambda: self.save_file(filepath)).pack(side="left", padx=5)

        self.refresh()

    def refresh(self):
        self.tree.delete(*self.tree.get_children())
        for t, n in zip(self.bots_names, self.bots_lobby_times):
            self.tree.insert("", "end", values=(t, n))

    def add_item(self):
        self.bots_names.append("New bot nick")
        self.bots_lobby_times.append(0)
        self.refresh()

    def remove_item(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("Warning", "Select item to remove")
            return

        idx = self.tree.index(selected[0])
        del self.bots_names[idx]
        del self.bots_lobby_times[idx]
        self.refresh()

    def on_double_click(self, event):
        region = self.tree.identify("region", event.x, event.y)
        if region != "cell":
            return

        row_id = self.tree.identify_row(event.y)
        column = self.tree.identify_column(event.x)
        col_index = int(column.replace("#", "")) - 1
        item_index = self.tree.index(row_id)

        x, y, width, height = self.tree.bbox(row_id, column)

        value = self.tree.item(row_id)["values"][col_index]

        entry = tk.Entry(self.tree)
        entry.place(x=x, y=y, width=width, height=height)
        entry.insert(0, value)
        entry.focus()

        def save_edit(event=None):
            new_val = entry.get()

            if col_index == 1:
                try:
                    new_val = int(new_val)
                except ValueError:
                    messagebox.showerror("Error", "Number must be numeric")
                    return
                self.bots_lobby_times[item_index] = new_val
            else:
                self.bots_names[item_index] = new_val

            entry.destroy()
            self.refresh()

        entry.bind("<Return>", save_edit)
        entry.bind("<FocusOut>", save_edit)
        entry.bind("<Control-a>", self.select_all)
        entry.bind("<Control-A>", self.select_all)
        entry.bind("<<Paste>>", self.custom_paste)

    def save_file(self, filepath):
        self.bots_lobby_times = list(map(int, self.bots_lobby_times))
        self.bots_lobby_times, self.bots_names = zip(*sorted(zip(self.bots_lobby_times, self.bots_names)))

        self.data["bots_nicks"] = ";".join(self.bots_names)
        self.data["bots_lobby_times_to_appear"] = ";".join(map(str, self.bots_lobby_times))

        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=4)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to save file:\n{e}", parent=self.root)

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

def configureBotsNames(main_window):
    languages_folder = os.path.join(os.path.dirname(os.path.realpath(__file__)), "../../static/translations")
    editor = TkinterWindow(main_window, languages_folder)
    main_window.wait_window(editor.root)
