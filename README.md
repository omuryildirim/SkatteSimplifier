# SkatteSimplifier
A simple tool to simplify the process of calculating the tax return report for stock market trades in Trading212 for the
Swedish tax authority Skatteverket. To use this tool, you need to have a CSV file with the trade history from Trading212.
The tool will then generate a CSV file with the tax return report.

> [!NOTE]
> The tool will use USD, EUR and GBP rates defined in src/constants.ts file. Update them before calculating the report.

## How to use
#### 1. Export and download the trade history from Trading212 as a CSV file.
> [!IMPORTANT]  
> Export your history in two files. First one orders&transaction history and second one dividend&interest history.
> Select from the date you started trading until the end of the year.
#### 2. Put your CSV files into data folder.
#### 3. Rename your orders&transaction history file to year name (e.g. 2024.csv)
#### 4. Rename your dividend&interest history file to year name (e.g. 2024-dividend-interest.csv)
#### 5. Run the tool with the path to the CSV file as an argument.
```bash
pnpm i
pnpm calculate 2024 ${your_person_nummer} ${your_full_name}
``` 
#### 6. The tool will generate a BLANKETTER.SRU file and a summary.json file in the history folder.
#### 7. Check the generated report for correctness.
#### 8. Upload the generated BLANKETTER.SRU file to Skatteverket tax return.