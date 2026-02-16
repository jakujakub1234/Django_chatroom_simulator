import pandas as pd
import yaml
import os
import tkinter as tk
from tkinter import filedialog

class CsvGenerator:
    def __init__(self, qulatrics_ids_filename, results_directory):
        current_directory = os.path.dirname(os.path.realpath(__file__))

        self.users_qulatrics_ids = set((line.strip()) for line in open(qulatrics_ids_filename) if line.strip() != "")

        self.interactions_csv = pd.read_csv(f"{current_directory}/plain_csvs_from_database/interactions.csv")
        self.interactions_csv = self.interactions_csv.drop_duplicates(subset='qualtrics_id', keep="last")
        
        self.reports_csv = pd.read_csv(f"{current_directory}/plain_csvs_from_database/reports.csv")

        self.nicks_csv = pd.read_csv(f"{current_directory}/plain_csvs_from_database/nicks.csv")

        self.messages_csv = pd.read_csv(f"{current_directory}/plain_csvs_from_database/messages.csv")

        self.likes_csv = pd.read_csv(f"{current_directory}/plain_csvs_from_database/like_reactions.csv")

        self.hearts_csv = pd.read_csv(f"{current_directory}/plain_csvs_from_database/heart_reactions.csv")

        self.angry_csv = pd.read_csv(f"{current_directory}/plain_csvs_from_database/angry_reactions.csv")

        self.exitpoll_csv = pd.read_csv(f"{current_directory}/plain_csvs_from_database/exitpoll.csv")

        self.results_directory = results_directory

        # Filter by qualtrics_ids list

        self.interactions_csv = self.interactions_csv[self.interactions_csv['qualtrics_id'].isin(self.users_qulatrics_ids)]
        self.reports_csv = self.reports_csv[self.reports_csv['qualtrics_id'].isin(self.users_qulatrics_ids)]
        self.nicks_csv = self.nicks_csv[self.nicks_csv['qualtrics_id'].isin(self.users_qulatrics_ids)]
        self.messages_csv = self.messages_csv[self.messages_csv['qualtrics_id'].isin(self.users_qulatrics_ids)]
        self.likes_csv = self.likes_csv[self.likes_csv['qualtrics_id'].isin(self.users_qulatrics_ids)]
        self.hearts_csv = self.hearts_csv[self.hearts_csv['qualtrics_id'].isin(self.users_qulatrics_ids)]
        self.angry_csv = self.angry_csv[self.angry_csv['qualtrics_id'].isin(self.users_qulatrics_ids)]
        self.exitpoll_csv = self.exitpoll_csv[self.exitpoll_csv['qualtrics_id'].isin(self.users_qulatrics_ids)]

    def createInteractionsCsv(self):
        interactions = self.interactions_csv.groupby(['qualtrics_id'], as_index=False).agg({
            'xmin': 'last', 'hesitation': 'sum', 'mouse_movement_seconds': 'sum', 'scroll_seconds': 'sum', 'input_seconds': 'sum', 'is_chatroom_finished': 'sum'
        })

        interactions = interactions[['qualtrics_id', 'mouse_movement_seconds', 'scroll_seconds']]
        interactions.to_csv(f"{self.results_directory}/interactions.csv", sep=',', index=False)

    def createReportsPerUserCsv(self):
        reports = self.reports_csv
        reports = reports.groupby('qualtrics_id')['report_id'].value_counts().unstack(fill_value=0)

        reports = reports.rename(columns={
            1: 'RESPECT_NORM_DENY',
            0: 'RESPECT_NORM_CONFIRMED',
            2: 'MISINFORMATION'
        }).reset_index()

        reports.to_csv(f"{self.results_directory}/reports_per_user.csv", sep=',', index=False)

    def createReportsPerMessageCsv(self):
        reports = self.reports_csv    
        reports = reports.groupby('message_text')['report_id'].value_counts().unstack(fill_value=0)

        reports = reports.rename(columns={
            1: 'RESPECT_NORM_DENY',
            0: 'RESPECT_NORM_CONFIRMED',
            2: 'MISINFORMATION'
        }).reset_index()

        reports.to_csv(f"{self.results_directory}/reports_per_message.csv", sep=',', index=False)

    def createNicksCsv(self):
        self.nicks_csv.to_csv(f"{self.results_directory}/nicks.csv", sep=',', index=False)

    def createExtraDataCsv(self):
        nicks = self.nicks_csv
        nicks = nicks.drop_duplicates(subset='qualtrics_id', keep="last")

        extra_data = nicks
        extra_data = extra_data.drop('id', axis=1)
        
        extra_data = extra_data.drop('xmin', axis=1)

        extra_data['engagement'] = extra_data['qualtrics_id'].apply(lambda x: len(self.messages_csv.loc[self.messages_csv['qualtrics_id'] == x]))

        extra_data['avg_length_of_message_(words)'] = extra_data['qualtrics_id'].apply(
            lambda x: 
            (self.messages_csv.loc[self.messages_csv['qualtrics_id'] == x]['message']).apply(lambda x: len(x.split())).mean()
        )
        extra_data['avg_length_of_message_(letters)'] = extra_data['qualtrics_id'].apply(
            lambda x: 
            (self.messages_csv.loc[self.messages_csv['qualtrics_id'] == x]['message']).apply(lambda x: len(x)).mean()
        )

        angry_wihout_own = self.angry_csv
        angry_wihout_own = angry_wihout_own[angry_wihout_own['message_id'] > 0]
        angry_only_own = self.angry_csv
        angry_only_own = angry_only_own[angry_only_own['message_id'] < 0]  

        hearts_wihout_own = self.hearts_csv
        hearts_wihout_own = hearts_wihout_own[hearts_wihout_own['message_id'] > 0]
        hearts_only_own = self.hearts_csv
        hearts_only_own = hearts_only_own[hearts_only_own['message_id'] < 0]  

        likes_wihout_own = self.likes_csv
        likes_wihout_own = likes_wihout_own[likes_wihout_own['message_id'] > 0]
        likes_only_own = self.likes_csv
        likes_only_own = likes_only_own[likes_only_own['message_id'] < 0]  

        extra_data['angry_reactions_amount'] = extra_data['qualtrics_id'].apply(
            lambda x: len(angry_wihout_own[angry_wihout_own['qualtrics_id'] == x])
        )
        extra_data['heart_reactions_amount'] = extra_data['qualtrics_id'].apply(
            lambda x: len(hearts_wihout_own[hearts_wihout_own['qualtrics_id'] == x])
        )
        extra_data['like_reactions_amount'] = extra_data['qualtrics_id'].apply(
            lambda x: len(likes_wihout_own[likes_wihout_own['qualtrics_id'] == x])
        )

        extra_data['all_reactions_amount'] = extra_data['angry_reactions_amount'] + extra_data['heart_reactions_amount'] + extra_data['like_reactions_amount']
        extra_data['all_reactions_to_own_messages_amount'] = extra_data['qualtrics_id'].apply(
            lambda x: 
            len(likes_only_own[likes_only_own['qualtrics_id'] == x]) + 
            len(hearts_only_own[hearts_only_own['qualtrics_id'] == x]) + 
            len(angry_only_own[angry_only_own['qualtrics_id'] == x])
        )

        extra_data['avg_length_of_message_(words)'] = extra_data['avg_length_of_message_(words)'].fillna(0)
        extra_data['avg_length_of_message_(letters)'] = extra_data['avg_length_of_message_(letters)'].fillna(0)

        extra_data["hesitation"] = extra_data['qualtrics_id'].map(self.interactions_csv.set_index('qualtrics_id')['hesitation'])

        extra_data["avg_writing_time"] = extra_data['qualtrics_id'].apply(
            lambda x: 
            (self.interactions_csv.loc[self.interactions_csv['qualtrics_id'] == x]['input_seconds'].values[0]) / len((self.messages_csv.loc[self.messages_csv['qualtrics_id'] == x]['message'])) if len(self.interactions_csv.loc[self.interactions_csv['qualtrics_id'] == x]['input_seconds']) > 0 and len((self.messages_csv.loc[self.messages_csv['qualtrics_id'] == x]['message'])) > 0 else 0
        )

        extra_data["uncertainty"] = extra_data['avg_writing_time'] - 1.5 * extra_data['avg_length_of_message_(words)']

        extra_data["mouse_move_seconds"] = extra_data['qualtrics_id'].map(self.interactions_csv.set_index('qualtrics_id')['mouse_movement_seconds'])
        extra_data["scroll_seconds"] = extra_data['qualtrics_id'].map(self.interactions_csv.set_index('qualtrics_id')['scroll_seconds'])
        extra_data["input_seconds"] = extra_data['qualtrics_id'].map(self.interactions_csv.set_index('qualtrics_id')['input_seconds'])
        extra_data["is_chatroom_finished"] = extra_data['qualtrics_id'].map(self.interactions_csv.set_index('qualtrics_id')['is_chatroom_finished'])

        extra_data["exitpoll_vote"] = extra_data['qualtrics_id'].map(self.exitpoll_csv.set_index('qualtrics_id')['is_yes'])
        extra_data["vote_seconds"] = extra_data['qualtrics_id'].map(self.exitpoll_csv.set_index('qualtrics_id')['vote_seconds'])
        exitpoll_vote_map = {
            't': 'Yes',
            'f': 'No'
        }
        extra_data['exitpoll_vote'] = extra_data['exitpoll_vote'].map(exitpoll_vote_map)

        extra_data = extra_data.rename(columns={'qualtrics_id': 'random_id'})

        extra_data = extra_data.drop("is_chatroom_finished", axis=1)

        extra_data.to_csv(f"{self.results_directory}/extra_data.csv", sep=',', index=False)
        
def createRawCsvFilesFromDb():
    current_directory = os.path.dirname(os.path.realpath(__file__))

    with open(f'{current_directory}/../../secrets.yaml', 'r') as file:
        yaml_file = yaml.safe_load(file)
        database_ip = yaml_file['DATABASE_IP']
        database_user = yaml_file['DATABASE_USER']
        database_password = yaml_file['DATABASE_PASSWORD']
        database_name = yaml_file['DATABASE_NAME']
    
    
    if not os.path.exists(f"{current_directory}/plain_csvs_from_database"):
        os.makedirs(f"{current_directory}/plain_csvs_from_database")

    # TODO refactor after moving a lot of code to some configuration JSON
    downloadCsvFromDb(database_user, database_password, database_ip, database_name, "pages_nicks", "nicks")
    downloadCsvFromDb(database_user, database_password, database_ip, database_name, "pages_messages", "messages")
    downloadCsvFromDb(database_user, database_password, database_ip, database_name, "pages_angryreactions", "angry_reactions")
    downloadCsvFromDb(database_user, database_password, database_ip, database_name, "pages_heartreactions", "heart_reactions")
    downloadCsvFromDb(database_user, database_password, database_ip, database_name, "pages_likereactions", "like_reactions")
    downloadCsvFromDb(database_user, database_password, database_ip, database_name, "pages_interactions", "interactions")
    downloadCsvFromDb(database_user, database_password, database_ip, database_name, "pages_reports", "reports")
    downloadCsvFromDb(database_user, database_password, database_ip, database_name, "pages_exitpoll", "exitpoll")

def downloadCsvFromDb(db_user, db_password, db_ip, db_name, table_name, csv_name):
    current_directory = os.path.dirname(os.path.realpath(__file__))
    command = f'PGPASSWORD={db_password} psql -h {db_ip} -d {db_name} -U {db_user} -c "\COPY (SELECT xmin, * FROM {table_name} WHERE LENGTH(qualtrics_id) = 5) TO STDOUT WITH (FORMAT CSV, HEADER)"'

    res = os.popen(command).read()

    with open(f"{current_directory}/plain_csvs_from_database/{csv_name}.csv", "w") as myFile:
        myFile.write(res)

class TkinterWindow:
    def __init__(self, main_window):
        self.qulatrics_ids_filename = ""
        self.results_directory = os.path.dirname(os.path.realpath(__file__)) + "/results"
        self.download_new_csvs = False

        self.root = tk.Toplevel(main_window)
        self.root.title("Select qualtrics_ids file")
        self.root.bind("<Return>", lambda event: self.closeWindow())

        self.is_checkbox = tk.BooleanVar(value=True)

        tk.Checkbutton(
            self.root,
            text="Download new csvs from DB?",
            variable=self.is_checkbox
        ).pack(pady=5)

        label = tk.Label(self.root, text="Select file with qulatrics ids of participants")
        label.pack()

        self.qulatrics_ids_file_var = tk.StringVar()

        frame = tk.Frame(self.root)
        frame.pack(pady=5)

        tk.Entry(frame, textvariable=self.qulatrics_ids_file_var, width=40).pack(side=tk.LEFT)
        tk.Button(frame, text="Browse", command=self.choose_file).pack(side=tk.LEFT)

        label2 = tk.Label(self.root, text="Select directory where results will be store")
        label2.pack()

        self.results_directory_var = tk.StringVar()
        self.results_directory_var.set(self.results_directory)

        frame2 = tk.Frame(self.root)
        frame2.pack(pady=5)

        tk.Entry(frame2, textvariable=self.results_directory_var, width=40).pack(side=tk.LEFT)
        tk.Button(frame2, text="Browse", command=self.choose_directory).pack(side=tk.LEFT)

        self.error_no_file_label_str = tk.StringVar()
        error_no_file_label = tk.Label(self.root, textvariable=self.error_no_file_label_str, fg='#f00')
        error_no_file_label.pack()

        tk.Button(self.root, text="Start", command=self.closeWindow).pack(pady=10)

    def choose_directory(self):
        tmp_results_directory = filedialog.askdirectory(
            initialdir=self.results_directory
        )

        self.results_directory_var.set(tmp_results_directory)

        self.results_directory = self.results_directory_var.get()

    def choose_file(self):
        tmp_qulatrics_ids_filename = filedialog.askopenfilename(
            filetypes=[("Txt files","*.txt")]
        )

        self.qulatrics_ids_file_var.set(tmp_qulatrics_ids_filename)

        self.qulatrics_ids_filename = self.qulatrics_ids_file_var.get()

    def closeWindow(self):
        if self.qulatrics_ids_filename == "":
            self.error_no_file_label_str.set("Choose qualtrics ids file before starting script")
            return
        
        self.download_new_csvs = self.is_checkbox.get()
        self.root.destroy()

def dbDataGenerator(main_window):
    tkinter_window = TkinterWindow(main_window)
    main_window.wait_window(tkinter_window.root) 

    download_new_csvs = tkinter_window.download_new_csvs
    qulatrics_ids_filename = tkinter_window.qulatrics_ids_filename
    results_directory = tkinter_window.results_directory

    if download_new_csvs:
        createRawCsvFilesFromDb()

    csv_generator = CsvGenerator(qulatrics_ids_filename, results_directory)

    csv_generator.createInteractionsCsv()
    csv_generator.createReportsPerUserCsv()
    csv_generator.createReportsPerMessageCsv()
    csv_generator.createNicksCsv()
    csv_generator.createExtraDataCsv()
