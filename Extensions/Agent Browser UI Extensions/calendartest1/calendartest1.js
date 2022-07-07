let label;
let field;
let isRequired;
let dateFieldWidth;
let textFieldWidth;
const APPNAME = 'update_calendar_field';
let extensionProviderPromise = null;
let workspaceRecordPromise = null;

/* eslint-disable-next-line no-unused-vars */
function updateTextField(inputComponent) {
  let monthYear;
  if (inputComponent.type === 'date') {
    const yearMonth = inputComponent.value.substring(0, inputComponent.value.lastIndexOf('-'));
    const year = yearMonth.substring(0, yearMonth.lastIndexOf('-'));
    const yearMonthArray = yearMonth.split('-');
    const month = yearMonthArray[yearMonthArray.length - 1];
    monthYear = month + '/' + year;
  } else {
    monthYear = inputComponent.value;
  }
  const isValid = inputComponent.checkValidity();
  if (isValid == false && inputComponent.value != '') {
    openModalWindow('invalid pattern');
    monthYear = '';
  }
  getWorkspaceRecord().then((workspaceRecord)=>{workspaceRecord.updateField(field, monthYear)});
}

/* eslint-disable-next-line no-unused-vars */
function removeCss() {
  if ($('#textField').css('border') != null) {
    $('#textField').css('border', '');
  }
}

function updateDate() {
  getWorkspaceRecord().then((workspaceRecord)=>{
      workspaceRecord.getFieldValues([field]).then(function(IFieldDetails) {
        const mfgDateFieldValue = IFieldDetails.getField(field).getValue();
        if (mfgDateFieldValue !== null || mfgDateFieldValue !== undefined) {
          $('#textField').val(mfgDateFieldValue);
          const arrVintage = mfgDateFieldValue.split('/');
          const VintageMonth = arrVintage[0];
          const VintageYear = arrVintage[1];
          $('#calendar').val(VintageYear + '-' + VintageMonth + '-' + '01');
        }
      });
    });
 }

function checkRequired(workspaceRecordSaving) {
  const TextFieldValue = $('#textField').val();
  if (TextFieldValue === '' && isRequired) {
    workspaceRecordSaving.getCurrentEvent().cancel();
    $('#textField').css('border', 'red solid 2px');
    openModalWindow('empty date');
  }
}

getExtensionProvider().then(function(extensionProvider) {
  extensionProvider.getGlobalContext().then(function(globalContext) {
    globalContext.getContainerContext().then(function(containerContext) {
      containerContext.getProperties(['field', 'label', 'isRequired','textFieldWidth','dateFieldWidth']).then(function(collection) {
        label = collection.get('label').getValue();
        field = collection.get('field').getValue();
        isRequired = collection.get('isRequired').getValue();
        textFieldWidth = collection.get('textFieldWidth').getValue();
        dateFieldWidth = collection.get('dateFieldWidth').getValue();
		$('#labelText').text(label);
		//$('#calendar').css('width',window.document.body.clientWidth-100);
		//$('#textField').css('width',window.document.body.clientWidth-25-100);
		if(isRequired){
			$('.asterisk').css('display','');
		}
        extensionProvider.registerWorkspaceExtension(function(workspaceRecord) {
          workspaceRecord.addFieldValueListener(field, updateDate);
          workspaceRecord.addRecordSavingListener(checkRequired);
          const recordId = workspaceRecord.getWorkspaceRecordId();
          if (recordId > 0) {
            updateDate();
          }
        });
      });
    });
  });
});

function getExtensionProvider() {
  if (!extensionProviderPromise) {
    extensionProviderPromise = ORACLE_SERVICE_CLOUD.extension_loader.load(APPNAME);
  }
  return extensionProviderPromise;
}

function getWorkspaceRecord() {
  if(workspaceRecordPromise === null) {
    workspaceRecordPromise = new ORACLE_SERVICE_CLOUD.ExtensionPromise();
    getExtensionProvider().then((extensionProvider)=>{
      extensionProvider.registerWorkspaceExtension(function(workspaceRecord) {
        workspaceRecordPromise.resolve(workspaceRecord);
      });
    });
  }
  return workspaceRecordPromise;
}

function openModalWindow(reason) {
  getExtensionProvider().then(function(extensionProvider) {
    extensionProvider.registerUserInterfaceExtension(function(iUserInterfaceContext) {
      iUserInterfaceContext.getModalWindowContext().then(function(iModalWindowContext) {
        const modalWindow = iModalWindowContext.createModalWindow();
        modalWindow.setTitle('Please correct date format');
        modalWindow.setContentUrl('correctRegex.html?reason='+reason);
        modalWindow.setHeight('70px');
        modalWindow.setWidth('330px');
        modalWindow.setClosable(true);
        modalWindow.render();
      });
    });
  });
}

