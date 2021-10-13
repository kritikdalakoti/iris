import xlsxwriter
import requests
import json
import sys

arguments = sys.argv[1:]
companyId = arguments[0]
userId = arguments[1]
reportId = arguments[2]
startDate = arguments[3]
endDate = arguments[4]

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

#reportName = "/home/pratik/Downloads/iris/excel-files/" + "fixed-report-"+str(reportId)+"-"+str(startDate)+ ".xlsx"
reportName = "/home/ubuntu/irisbackend/excel-files/" + "fixed-report-"+str(reportId)+"-"+str(startDate)+ ".xlsx"

workbook  = xlsxwriter.Workbook(reportName)
worksheetReport = workbook.add_worksheet('report')

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
       worksheetReport.merge_range(x['cell'], x['title'])
    else:
#        print(x['cell'],x['title'])
        worksheetReport.write(x['cell'], x['title'])

rowStartIndex = 22

worksheetReport.write_row(rowStartIndex,0,report['subHeadersStringArray'])

rowStartIndex = 23
for x in (report['data']):
   # print(x)
    worksheetReport.write_row(rowStartIndex ,0,x)
    rowStartIndex = rowStartIndex + 1


chart1 = workbook.add_chart({'type': 'line'})

chart1.set_size({'width': 130, 'height': 350})

length = len(report['subHeadersStringArray']) 
for x in (report['chartDataPlot']):
    #print(x)
    chart1.add_series(x)

chart1.set_style(10)
chart1.set_title ({'name': 'Fixed Report -'+str(reportId)})
chart1.set_x_axis({'name': 'Date'})  
worksheetReport.insert_chart('A2', chart1, {'x_scale': length - 1, 'y_scale': 1})

workbook.close()
