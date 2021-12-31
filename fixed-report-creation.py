import xlsxwriter
import requests
import json
import sys
import re

arguments = sys.argv[1:]
companyId = arguments[0]
userId = arguments[1]
reportId = arguments[2]
startDate = arguments[3]
endDate = arguments[4]
genratedReportType = arguments[5]

# companyId = 62
# fixedReportId = 12
# startDate = 1627236033837
# endDate = 1627268148613
url = "http://localhost:50101/api/v1.0.0/companies/"+str(companyId)+"/users/"+str(userId)+"/fixed-report/"+str(reportId)+"/start-date/"+str(startDate)+"/end-date/"+str(endDate)+"/genrate-fixed-report-excelsheet"

print("Url",url)
response = requests.get(url=url)
print("response in python////////////////",response)
finalData = json.loads(response.text)

# Check validations for data prepration
#print(finalData)
report = finalData['result']
global reportName 
#reportName = "/home/pratik/Downloads/iris/excel-files/" + "fixed-report-"+str(reportId)+"-"+str(startDate)+ ".xlsx"
if(report['reportType'] == 0 or report['reportType'] == '0'):
   reportName = "/home/ubuntu/irisbackend/excel-files/" + "fixed-report-"+str(reportId)+"-"+str(startDate)+ ".xlsx"
   # reportName = "/home/pratik/Downloads/iris/excel-files/" + "fixed-report-"+str(reportId)+"-"+str(startDate)+ ".xlsx"
if(report['reportType'] == 1 or report['reportType'] == '1'):
   reportName = "/home/ubuntu/irisbackend/excel-files/" + "msedcl-fixed-report-"+str(reportId)+"-"+str(startDate)+ ".xlsx"
   # reportName = "/home/pratik/Downloads/iris/excel-files/" + "msedcl-fixed-report-"+str(reportId)+"-"+str(startDate)+ ".xlsx"
workbook  = xlsxwriter.Workbook(reportName)
worksheetReport = workbook.add_worksheet('report')
headerBorder = workbook.add_format({"border":1})
sheet_border_format = workbook.add_format()
sheet_border_format.set_bg_color('#B9CCE4')
borderFormat = workbook.add_format({'top' : 1,"left":1,"right":1,"bottom": 1})

#  Formats 

#sheet_title_format = 
#sheet_title_format.set_bold()
#sheet_title_format.set_font_size(18)

# adding data

#for x in range(len(report['subheaders'])):

 #   if( report['subheaders']['isMerge']  ):
  #      worksheetGlance.wri(report['headers']['cell'],report['headers']['title'] ,sheet_title_format)


for x in (report['headers']):
    print(x['title'])

    if(x['isMerge']):
       #print(x['title'])
       worksheetReport.merge_range(x['cell'], x['title'],headerBorder)
    else:
#        print(x['cell'],x['title'])
        worksheetReport.write(x['cell'], x['title'],headerBorder)

endHeader = report['headers'][len(report['headers']) -1]
endCell = re.split('(\d+)',str(endHeader['cell']).split(":")[1])[0]

rowStartIndex = 22

worksheetReport.write_row(rowStartIndex,0,report['subHeadersStringArray'])
length = 0
dataLenght = 0
columnStartIndex = 0
for x in(report['subHeadersStringArray']) :
    dataLenght = int(len(x))
    if dataLenght < 10:
       length = int(len(x)) + 15
    else:
       length = int(len(x))
    worksheetReport.set_column(columnStartIndex,columnStartIndex,length)
    columnStartIndex = columnStartIndex + 1

rowStartIndex = 23
for x in (report['data']):
   # print(x)
    worksheetReport.write_row(rowStartIndex ,0,x)
    rowStartIndex = rowStartIndex + 1

finalEndCell = endCell + str(rowStartIndex)
worksheetReport.conditional_format('A23:'+finalEndCell, {'type': 'no_errors','format': borderFormat})
# worksheetReport.merge_range('A23:G30',"",sheet_border_format)

chart1 = workbook.add_chart({'type': 'line'})

chart1.set_size({'width': 130, 'height': 350})

length = len(report['subHeadersStringArray']) 
for x in (report['chartDataPlot']):
    #print(x)
    chart1.add_series(x)

chart1.set_style(10)
if(report['reportType'] == 0 or report['reportType'] == '0'):
   chart1.set_title ({'name': 'Fixed Report -'+str(reportId)})
if(report['reportType'] == 1 or report['reportType'] == '1'):
   chart1.set_title ({'name': 'MSEDCL Fixed Report -'+str(reportId)})

chart1.set_x_axis({'name': 'Date'})  
worksheetReport.insert_chart('A2', chart1, {'x_scale': length - 1, 'y_scale': 1})
workbook.close()

fixedReportCondition = {}
fixedReportCondition['fixedReportId'] = int(reportId)
fixedReportCondition['companyId'] = int(companyId)
fixedReportCondition['reportType'] = int(report['reportType'])
fixedReportCondition['startDate'] = int(startDate)
fixedReportCondition['genratedReportType'] = genratedReportType
print(fixedReportCondition)

url = "http://localhost:50101/api/v1.0.0/send-fixed-report"
response = requests.post(url=url, data=fixedReportCondition)
# print(response)
