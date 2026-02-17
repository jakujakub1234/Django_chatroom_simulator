import tkinter as tk
import json
import os
import shutil

class TkinterWindow:
    def __init__(self, parent):
        self.current_directory = os.path.dirname(os.path.realpath(__file__))
        self.json_filepath = os.path.join(self.current_directory, "../../chatroom_configuration.json")

        self.load_json()

        self.root = tk.Toplevel(parent)
        self.root.title("Supported Languages Editor")
        #self.root.geometry("300x300")

        label = tk.Label(self.root, font=("Helvetica", 15), text="REMEMBER:\n\n\
1. Deleting language will delete all content related to this language permapermanently\n\
2. Language en cannot be deleted\n\
3. New language is added by copying en version of all related files. You need to manualy provide your translations files in these directories:\n\n\
pages/chat_ai/files_for_ai/{new_language}\n\
static/translations/{new_language}.json\n\
static/js/curse_words/{new_language}\n\
static/js/bots_messages/{new_language}\n")
        
        label.pack()

        self.error_english_delete_label_str = tk.StringVar()
        error_english_delete_label = tk.Label(self.root, textvariable=self.error_english_delete_label_str, fg='#f00')
        error_english_delete_label.pack()

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
            self.addFilesAndDirectoriesForNewLanguage(new_lang)
            self.refresh_listbox()

        self.new_lang_entry.delete(0, "end")

    def remove_selected(self):
        selected = self.listbox.curselection()
        if not selected:
            return
        for index in reversed(selected):
            lang = self.listbox.get(index)

            if lang == "en":
                self.error_english_delete_label_str.set("Language en cannot be deleted!")
                continue

            confirm = tk.messagebox.askyesno(
                "Confirm deletion",
                "Are you sure?\nAll data for selected language(s) will be deleted!",
                parent=self.root
            )

            if not confirm:
                return
            
            self.data["supported_languages"].remove(lang)
            self.removeFilesAndDirectoriesForDeletedLanguage(lang)

        self.save_json()
        self.refresh_listbox()

    def addFilesAndDirectoriesForNewLanguage(self, lang_code):
        chat_ai_directory = self.current_directory + "/../../pages/chat_ai/files_for_ai"
        shutil.copytree(chat_ai_directory + "/en", chat_ai_directory + "/" + lang_code)

        translations_directory = self.current_directory + "/../../static/translations"
        shutil.copy2(translations_directory + "/en.json", translations_directory + "/" + lang_code + ".json")

        curse_words_directory = self.current_directory + "/../../static/js/curse_words"
        shutil.copytree(curse_words_directory + "/en", curse_words_directory + "/" + lang_code)

        bots_messages_directory = self.current_directory + "/../../static/js/bots_messages"
        shutil.copytree(bots_messages_directory + "/en", bots_messages_directory + "/" + lang_code)

    def removeFilesAndDirectoriesForDeletedLanguage(self, lang_code):
        chat_ai_en_directory = self.current_directory + "/../../pages/chat_ai/files_for_ai"
        shutil.rmtree(chat_ai_en_directory + "/" + lang_code)

        translations_directory = self.current_directory + "/../../static/translations"
        os.remove(translations_directory + "/" + lang_code + ".json")

        curse_words_directory = self.current_directory + "/../../static/js/curse_words"
        shutil.rmtree(curse_words_directory + "/" + lang_code)

        bots_messages_directory = self.current_directory + "/../../static/js/bots_messages"
        shutil.rmtree(bots_messages_directory + "/" + lang_code)

def editSupportedLanguages(main_window):
    editor = TkinterWindow(main_window)
    main_window.wait_window(editor.root)
