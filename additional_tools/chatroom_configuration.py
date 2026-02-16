import tkinter as tk

from draft_excel_to_json_files_with_bots_messages.draft_excel_to_json_files import draftExcelToJsonFiles
from db_data_csv_generator.generator import dbDataGenerator
from configure_secrets.configure_secrets import configureSecrets

def run_with_message(parent, func):
    msg = tk.Label(parent, text="Please wait...", fg="blue")
    msg.pack(pady=5)

    parent.update_idletasks()

    try:
        func(parent)
    finally:
        msg.destroy()

root = tk.Tk()
root.title("Chatroom configuration")

tk.Button(root, text="Generate json files from draft excel", command=lambda: run_with_message(root, draftExcelToJsonFiles)).pack(pady=10)
tk.Button(root, text="Generate CSVs with database data", command=lambda: run_with_message(root, dbDataGenerator)).pack(pady=10)
tk.Button(root, text="Configure secrets", command=lambda: run_with_message(root, configureSecrets)).pack(pady=10)


root.mainloop()
