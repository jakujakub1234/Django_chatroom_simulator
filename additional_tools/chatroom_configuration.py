import tkinter as tk
import tkinter.font as tkfont

from draft_excel_to_json_files_with_bots_messages.draft_excel_to_json_files import draftExcelToJsonFiles
from db_data_csv_generator.generator import dbDataGenerator
from configure_variables.configure_variables import configureVariables
from configure_secrets.configure_secrets import configureSecrets
from edit_supported_languages.edit_supported_languages import editSupportedLanguages
from edit_translations.edit_translations import editTranslations

def run_with_message(parent, func):
    msg = tk.Label(parent, text="Please wait...", fg="blue")
    msg.grid(row=0, column=0, padx=15, pady=25)

    parent.update_idletasks()

    try:
        func(parent)
    finally:
        msg.grid_forget()

root = tk.Tk()
default_font = tkfont.nametofont("TkDefaultFont")
default_font.configure(size=14) 
root.title("Chatroom configuration")

tk.Button(root, text="Generate json files from draft excel", command=lambda: run_with_message(root, draftExcelToJsonFiles)).grid(row=1, column=0, padx=15, pady=25)
tk.Button(root, text="Generate CSVs with database data", command=lambda: run_with_message(root, dbDataGenerator)).grid(row=1, column=1, padx=15, pady=25)
tk.Button(root, text="Configure variables", command=lambda: run_with_message(root, configureVariables)).grid(row=2, column=0, padx=15, pady=25)
tk.Button(root, text="Configure secrets", command=lambda: run_with_message(root, configureSecrets)).grid(row=2, column=1, padx=15, pady=25)
tk.Button(root, text="Add / Remove supported languages", command=lambda: run_with_message(root, editSupportedLanguages)).grid(row=3, column=0, padx=15, pady=25)
tk.Button(root, text="Edit all texts on website", command=lambda: run_with_message(root, editTranslations)).grid(row=3, column=1, padx=15, pady=25)

root.mainloop()
