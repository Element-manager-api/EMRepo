var workspaceObj="", extProvider, accountId = 0, _restURL="", _sessionToken = "", interfaceUrl="",recordId = 0;
 

ORACLE_SERVICE_CLOUD.extension_loader.load("CLAL3_Contact_Age" , "v1.0")
.then(function(extensionProvider)
	{
		extProvider = extensionProvider;
    extensionProvider.getGlobalContext().then(function(globalContext){
						_restURL = globalContext.getInterfaceServiceUrl("REST");
						accountId = globalContext.getAccountId();
						interfaceUrl = globalContext.getInterfaceUrl();
						globalContext.getSessionToken().then(
						   function(sessionToken){
							  _sessionToken = sessionToken;
							//console.log("session" + _sessionToken);
						   extensionProvider.registerWorkspaceExtension(function(workspaceRecord)
							{
					            workspaceObj = workspaceRecord; 
						 
							      workspaceRecord.addDataLoadedListener(calculateAge).prefetchWorkspaceFields(["Contact.CO$birth_date"]);
							      workspaceRecord.addFieldValueListener('Contact.CO$birth_date', calculateAge).prefetchWorkspaceFields(["Contact.CO$birth_date"]);							   


								});

						  });

						});

});

 
function calculateAge(param)
{
  
  var dob  = param.event.fields["Contact.CO$birth_date"];
  console.log(dob);
  if(dob == null || dob =='null' || typeof dob ==='undefined'){
	   workspaceObj.updateField('Contact.CO$ContactAgeNew',null);
	  return;}
  
  
  
var dob = new Date(dob);  
    
    var dobYear = dob.getYear();  
    var dobMonth = dob.getMonth();  
    var dobDate = dob.getDate();  
      
    //get the current date from the system  
    var now = new Date();  
    //extract the year, month, and date from current date  
    var currentYear = now.getYear();  
    var currentMonth = now.getMonth();  
    var currentDate = now.getDate();  
      
    //declare a variable to collect the age in year, month, and days  
    var age = {};  
    var ageString = "";  
    
    //get years  
    yearAge = currentYear - dobYear;  
      
    //get months  
    if (currentMonth >= dobMonth)  
      //get months when current month is greater  
      var monthAge = currentMonth - dobMonth;  
    else {  
      yearAge--;  
      var monthAge = 12 + currentMonth - dobMonth;  
    }  
  
    //get days  
    if (currentDate >= dobDate)  
      //get days when the current date is greater  
      var dateAge = currentDate - dobDate;  
    else {  
      monthAge--;  
      var dateAge = 31 + currentDate - dobDate;  
  
      if (monthAge < 0) {  
        monthAge = 11;  
        yearAge--;  
      }  
    }  
    //group the age in a single variable  
    age = {  
    years: yearAge,  
    months: monthAge,  
    days: dateAge  
    };  
        
        
    if ( (age.years > 0) && (age.months > 0) && (age.days > 0) )  
       ageString = age.years + "." + age.months;  
    else if ( (age.years == 0) && (age.months == 0) && (age.days > 0) )  
       ageString = "Only " + age.days + " days old!";  
    //when current month and date is same as birth date and month  
    else if ( (age.years > 0) && (age.months == 0) && (age.days == 0) )  
       ageString = age.years +"." + "0"
    else if ( (age.years > 0) && (age.months > 0) && (age.days == 0) )  
       ageString = age.years + "." + age.months;  
      else if ( (age.years > 0) && (age.months == 0) && (age.days > 0) )  
       ageString = age.years +"." + "0";  
  
  	if (ageString != null)
	{
	   workspaceObj.updateField('Contact.CO$ContactAgeNew',ageString);
	} else {
		 workspaceObj.updateField('Contact.CO$ContactAgeNew',"No Value");
	}

//  console.log(ageageString);
    //display the calculated age  
}
/**
This method is a re-usable function for HTTP GET operation taking site URL as parameter along with session from global variable 
@param string - URL of the Site 
*/
 function getRequestSimple(url) {
            return new Promise(function (resolve, reject) {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                        resolve(xmlHttp.responseText);
                    } 				   
                }
                xmlHttp.open("GET", url, true); // true for asynchronous
                xmlHttp.send(null);
            });
 }

 
/**
This method is a re-usable function for HTTP GET operation taking site URL as parameter along with session from global variable 
@param string - URL of the Site 
*/
 function getRequest(url) {
            return new Promise(function (resolve, reject) {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
                        resolve(JSON.parse(xmlHttp.responseText));
                    } 
				     if (xmlHttp.readyState == 4 && xmlHttp.status != 200)
					{
						reject(JSON.parse(xmlHttp.responseText));
					}
                }
                xmlHttp.open("GET", url, true); // true for asynchronous
             	xmlHttp.setRequestHeader("Authorization", "Session " + _sessionToken);
				xmlHttp.setRequestHeader("OSvC-CREST-Application-Context", "Immigration");
                xmlHttp.send(null);
            });
 }

/**
This method is a re-usable function for Update operation (PATCH via HTTP POST) taking site URL as parameter along with session from global variable 
@param string - URL of the Site 
@param string - postData - represents Post data to be used in the Update operation

*/
   function postRequestPatch(url,postData) {
            return new Promise(function (resolve, reject) {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function () {
                    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
						 resolve();
                    }
				   if (xmlHttp.readyState == 4 && xmlHttp.status != 200)
					{
					   if (xmlHttp.responseText != null)
					   {
						   reject(JSON.parse(xmlHttp.responseText));
					   }
					   else {
							 reject(JSON.parse({"title":"There is some unexpected error","status":500, "detail": "Error while updating Object"}));
					   }
						
					}
                }
                xmlHttp.open("POST", url, true); // true for asynchronous
             	xmlHttp.setRequestHeader("Authorization", "Session " + _sessionToken);
				xmlHttp.setRequestHeader("OSvC-CREST-Application-Context", "Immigration");
				xmlHttp.setRequestHeader("X-HTTP-Method-Override", "PATCH");
                xmlHttp.send(postData);
            });
 }

/**
This method is a re-usable function for HTTP POST operation taking site URL as parameter along with session from global variable 
@param string - URL of the Site 
@param string - postData - represents Post data to be used in the POST operation
*/
    function postRequest(url,postData) {
            return new Promise(function (resolve, reject) {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.onreadystatechange = function () {
					//console.log(xmlHttp);
                    if (xmlHttp.readyState == 4 && (xmlHttp.status == 200 || xmlHttp.status== 201)) {
						  resolve(JSON.parse(xmlHttp.responseText));			
                    }

					if (xmlHttp.readyState == 4 && (xmlHttp.status != 200 || xmlHttp.status != 201))
					{
						reject(JSON.parse(xmlHttp.responseText));
					}
					 
                }
                xmlHttp.open("POST", url, true); // true for asynchronous
             	xmlHttp.setRequestHeader("Authorization", "Session " + _sessionToken);
				xmlHttp.setRequestHeader("OSvC-CREST-Application-Context", "Immigration");
				xmlHttp.send(postData);
            });
 }