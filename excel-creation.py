import xlsxwriter
import requests
import json
import sys
import re

arguments = sys.argv[1:]
companyId = arguments[0]
reportId = arguments[1]
startDate = arguments[2]
endDate = arguments[3]

#companyId = 36
#reportId = 43
#startDate = 1616816250446
#endDate = 1616819719542

url = "http://localhost:50101/api/v1.0.0/companies/"+str(companyId)+"/custom-report/"+str(reportId)+"/start-date/"+str(startDate)+"/end-date/"+str(endDate)+"/generate-excel-sheet"
#url = "http://localhost:50101/api/v1.0.0/companies/16/custom-report/1/generate-excel-sheet" ; 
print("Url",url)
response = requests.get(url=url)
print("response in python////////////////",response)
finalData = json.loads(response.text)

# Check validations for data prepration
#print(finalData)
report = finalData['result']

# reportName = "/home/pratik/Downloads/iris/excel-files/" + "custom-report-"+str(reportId)+"-"+startDate+ ".xlsx"

reportName = "/home/ubuntu/irisbackend/excel-files/" + "custom-report-"+str(reportId) + "-"+startDate+ ".xlsx"


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

chart1 = workbook.add_chart({'type': 'line'})

chart1.set_size({'width': 130, 'height': 350})

length = len(report['subHeadersStringArray']) 
for x in (report['chartDataPlot']):
    #print(x)
    chart1.add_series(x)

chart1.set_style(10)
chart1.set_title ({'name': 'Custom Report -'+str(reportId)})
chart1.set_x_axis({'name': 'Date'})  
worksheetReport.insert_chart('A2', chart1, {'x_scale': length - 1, 'y_scale': 1})

workbook.close()
