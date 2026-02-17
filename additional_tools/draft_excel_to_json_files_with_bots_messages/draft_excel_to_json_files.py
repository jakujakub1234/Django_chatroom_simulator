import pandas as pd
import math

import tkinter as tk
from tkinter import filedialog

import os 
import json

class TkinterWindow:
    def __init__(self, parent):
        self.filename = ""
        self.language_code = ""

        self.root = tk.Toplevel(parent)
        self.root.title("Select language of messages and file")
        self.root.bind("<Return>", lambda event: self.closeWindow())

        label = tk.Label(self.root, text="Select language")
        label.pack()

        self.lb = tk.Listbox(self.root, height=4, name="language code")
        self.lb.pack(pady=5)

        self.current_directory = os.path.dirname(os.path.realpath(__file__))
        self.json_filepath = os.path.join(self.current_directory, "../../chatroom_configuration.json")

        with open(self.json_filepath, "r") as f:
            self.configuration_data = json.load(f)

        for language_codes in self.configuration_data["supported_languages"]:
            self.lb.insert(tk.END, language_codes)

        self.lb.selection_set(0)

        label2 = tk.Label(self.root, text="Select file with messages draft")
        label2.pack()

        self.file_var = tk.StringVar()
        frame = tk.Frame(self.root)
        frame.pack(pady=5)

        tk.Entry(frame, textvariable=self.file_var, width=40).pack(side=tk.LEFT)
        tk.Button(frame, text="Browse", command=self.choose_file).pack(side=tk.LEFT)

        self.error_no_file_label_str = tk.StringVar()
        error_no_file_label = tk.Label(self.root, textvariable=self.error_no_file_label_str, fg='#f00')
        error_no_file_label.pack()
        
        tk.Button(self.root, text="Start", command=self.closeWindow).pack(pady=10)

    def choose_file(self):
        tmp_filename = filedialog.askopenfilename(
            filetypes=[("Excel files","*.xlsx"), ("CSV files","*.csv")]
        )

        self.file_var.set(tmp_filename)

        self.filename = self.file_var.get()

    def closeWindow(self):
        if self.filename == "":
            self.error_no_file_label_str.set("Choose file before starting script")
            return

        selected = self.lb.curselection()

        self.language_code = [self.lb.get(i) for i in selected][0]
        self.root.destroy()

def draftExcelToJsonFiles(main_window):
    tkinter_window = TkinterWindow(main_window)

    main_window.wait_window(tkinter_window.root) 

    language_code = tkinter_window.language_code
    filename = tkinter_window.filename

    for start_column in [1,2,3]:
        if start_column == 1:
            prefix_name = "positive_"
        elif start_column == 2:
            prefix_name = "control_"
        elif start_column == 3:
            prefix_name = "negative_"
        else:
            continue

        if filename.split(".")[-1] == "xlsx":
            df = pd.read_excel(filename)
        elif filename.split(".")[-1] == "csv":
            df = pd.read_csv(filename)

        start_of_first_message = 0
        prev_time = 0

        res = "[\n"

        names = []
        messages = []

        for index, row in df.iterrows():
            name = row.iloc[0]
            message = row.iloc[start_column]
            respond_to = row.iloc[5]
            delta_time = row.iloc[8]
            emoji_ids = row.iloc[6]
            emoji_times = row.iloc[7]

            if delta_time == "" or math.isnan(delta_time):
                delta_time = -1
            else:
                delta_time = int(delta_time)

            print("PROCESSING MESSAGE IN ROW " + str(index + 2))

            message = message.replace('"', '\\"')

            names.append(name)
            messages.append(message)

            if str(name) == "nan": break

            if " " in name:
                name = name[:name.index(" ")]

            if delta_time == -1:
                next_message_time = int(0.5 * len(message.split()))
            else:
                next_message_time = int(0.5 * len(message.split())) + int(delta_time)
            
            start_of_first_message += next_message_time

            if start_of_first_message == prev_time:
                start_of_first_message += 1
            prev_time = start_of_first_message

            name_respond_to = ""
            message_respond_to = ""

            if respond_to != "" and not math.isnan(respond_to):
                name_respond_to = names[int(respond_to)-2]
                message_respond_to = messages[int(respond_to)-2]

            if emoji_ids != "" and str(emoji_ids) != "nan":
                emoji_ids = str(emoji_ids).replace(" ", "")
                emoji_times = str(emoji_times).replace(" ", "")
            else:
                emoji_ids = ""
                emoji_times = ""

            res += "{"
            res += f'''"seconds_to_wait_before_send": {int(start_of_first_message)}, '''
            res += f'''"bot_nick": "{name}", '''
            res += f'''"message": "{message}", '''
            res += f'''"name_respond_to": "{name_respond_to}", '''
            res += f'''"text_of_responded_message": "{message_respond_to}", '''
            res += f'''"emoji_ids": [{emoji_ids}], '''
            res += f'''"emoji_times": [{emoji_times}], '''
            res += "\"is_ai_respond_to_use\": false"
            res += "},\n"

        res = res[:-2]
        res += "\n]"

        dir_path = os.path.dirname(os.path.realpath(__file__))

        f = open(f"{dir_path}/../../static/js/bots_messages/{language_code}/{prefix_name}bots_messages.json", 'w' )
        f.write( res )
        f.close()