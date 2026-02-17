import tkinter as tk
from tkinter import messagebox
from tkinter import ttk
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

        try:
            with open(filepath, "r", encoding="utf-8") as f:
                self.data = json.load(f)
        except Exception as e:
            messagebox.showerror("Error", f"Failed to load {filepath}:\n{e}", parent=self.root)
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

        row_index = 0

        for i, (key, value) in enumerate(self.data.items()):
                if key in ("bots_nicks", "bots_lobby_times_to_appear"):
                    self.build_bots_editor(scrollable_frame, row_index)
                    row_index += 1
                    continue

        save_btn = tk.Button(editor_win, text="Save", command=lambda: self.save_file(filepath))
        save_btn.pack(pady=5)

    def build_bots_editor(self, parent, row):
        tk.Label(parent, text="Bots", anchor="w", width=30)\
            .grid(row=row, column=0, padx=5, pady=5, sticky="nw")

        frame = tk.Frame(parent)
        frame.grid(row=row, column=1, sticky="w")

        self.bots_tree = ttk.Treeview(frame, columns=("nick","time"), show="headings", height=5)
        self.bots_tree.heading("nick", text="Nick")
        self.bots_tree.heading("time", text="Time")
        self.bots_tree.pack()

        nicks = self.data["bots_nicks"].split(";")
        times = self.data["bots_lobby_times_to_appear"].split(";")

        for n, t in zip(nicks, times):
            self.bots_tree.insert("", "end", values=(n, t))

        btn_frame = tk.Frame(frame)
        btn_frame.pack()

        tk.Button(btn_frame, text="+", width=3, command=self.add_bot).pack(side="left")
        tk.Button(btn_frame, text="-", width=3, command=self.remove_bot).pack(side="left")

        self.bots_tree.bind("<Double-1>", self.edit_bot_cell)

    def add_bot(self):
        self.bots_tree.insert("", "end", values=("nick", "0"))

    def remove_bot(self):
        for item in self.bots_tree.selection():
            self.bots_tree.delete(item)

    def edit_bot_cell(self, event):
        item = self.bots_tree.identify_row(event.y)
        column = self.bots_tree.identify_column(event.x)

        if not item:
            return

        col = int(column[1:]) - 1
        x,y,w,h = self.bots_tree.bbox(item, column)

        entry = tk.Entry(self.bots_tree)
        entry.place(x=x, y=y, width=w, height=h)

        value = self.bots_tree.item(item)["values"][col]
        entry.insert(0, value)
        entry.focus()

        def save(e):
            vals = list(self.bots_tree.item(item)["values"])
            vals[col] = entry.get()
            self.bots_tree.item(item, values=vals)
            entry.destroy()

        entry.bind("<Return>", save)
        entry.bind("<FocusOut>", lambda e: entry.destroy())

    def save_file(self, filepath):
        for key, entry in self.entries.items():
            self.data[key] = entry.get()

        if hasattr(self, "bots_tree"):
            nicks = []
            times = []

            for row in self.bots_tree.get_children():
                nick, time = self.bots_tree.item(row)["values"]
                nicks.append(nick)
                times.append(time)

            self.data["bots_nicks"] = ";".join(nicks)
            self.data["bots_lobby_times_to_appear"] = ";".join(times)

        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(self.data, f, ensure_ascii=False, indent=4)

            messagebox.showinfo("Saved", f"{os.path.basename(filepath)} saved successfully!", parent=self.root)

        except Exception as e:
            messagebox.showerror("Error", f"Failed to save file:\n{e}", parent=self.root)


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
