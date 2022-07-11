/// <reference path = "../libs/osvcExtension.d.ts"/>
class DecimalCurrency {
    constructor() {
        this.registerExtensions();
    }
    updateDecimalDbField(workspaceRecord) {
        document.getElementById('decimalInput').addEventListener('blur', (blurEvent) => {
            const fieldValue = this.formatFieldValue(blurEvent);
            workspaceRecord.updateField(this.decimalField, fieldValue);
        });
    }
    formatFieldValue(blurEvent) {
        let content = blurEvent.target.value;
        if (!content) {
            return '';
        }
        content = this.stripRateDenotation(content);
        content = (+content).toFixed(this.fieldPrecision);
        this.updateDisplayField(content);
        const contentCorrected = Math.round(+content * (Math.pow(10, this.fieldPrecision)));
        return contentCorrected.toString();
    }
    updateDisplayField(inputValue) {
        if (this.isDenotationPrefix === true) {
            $('#decimalInput').val(`${this.rateDenotation} ${inputValue}`);
        }
        else {
            $('#decimalInput').val(`${inputValue} ${this.rateDenotation}`);
        }
    }
    validateKeyPress() {
        document.getElementById('decimalInput').addEventListener('keypress', (keypressEvent) => {
            this.validateKey(keypressEvent);
        });
        document.getElementById('decimalInput').addEventListener('change', (changeEvent) => {
            this.removeErrorLabel(changeEvent);
        });
    }
    removeErrorLabel(changeEvent) {
        const content = changeEvent.target.value;
        if (content !== '') {
            document.getElementById('decimalInput').classList.remove('invalid');
            document.getElementById('inputError').style.display = 'none';
        }
    }
    validateKey(keypressEvent) {
        let content = keypressEvent.target.value;
        const input = keypressEvent.key;
        const insertedCharPosition = keypressEvent.target.selectionEnd;
        if (this.checkValidation(input, content, insertedCharPosition)) {
            return true;
        }
        content = this.stripRateDenotation(content);
        const decimalCount = this.getFloatingCount(content);
        if (this.checkInvalidValue(input, decimalCount, keypressEvent)) {
            return false;
        }
    }
    checkValidation(input, content, insertedCharPosition) {
        if (input.length > 1 || this.checkDenotationAndPeriodIndex(input, content)) {
            return true;
        }
        const floatingPointPosition = content.indexOf('.');
        if (insertedCharPosition <= floatingPointPosition && !isNaN(input)) {
            return true;
        }
        return false;
    }
    checkDenotationAndPeriodIndex(input, content) {
        if ((input === this.rateDenotation && content.indexOf(this.rateDenotation) === -1) || (input === '.' && content.indexOf('.') === -1)) {
            return true;
        }
        return false;
    }
    checkInvalidValue(input, decimalCount, event) {
        if (isNaN(input) || (decimalCount >= this.fieldPrecision)) {
            event.preventDefault();
            this.showErrorPopUp();
            return true;
        }
        return false;
    }
    showErrorPopUp() {
        this.getExtensionProvider().then((extensionProvider) => {
            extensionProvider.registerUserInterfaceExtension((userInterfaceContext) => {
                userInterfaceContext.getPopupWindowContext().then((popupWindowContext) => {
                    const popupWindow = popupWindowContext.createPopupWindow('errorPopupWindow');
                    popupWindow.setContentUrl(`./alert.html?alertMessage=${this.invalidMessage}`);
                    popupWindow.setTitle('Invalid input');
                    popupWindow.render();
                });
            });
        });
    }
    stripRateDenotation(content) {
        if (this.isDenotationPrefix) {
            if (content.substring(0, this.rateDenotation.length) === this.rateDenotation) {
                content = content.substring(this.rateDenotation.length);
            }
        }
        else {
            const index = content.length - this.rateDenotation.length;
            if (content.substring(index, content.length) === this.rateDenotation) {
                content = content.substring(0, content.length - this.rateDenotation.length);
            }
        }
        return content;
    }
    registerExtensions() {
        this.getExtensionProvider().then((extensionProvider) => {
            extensionProvider.getGlobalContext().then((globalContext) => {
                globalContext.getContainerContext().then((containerContext) => {
                    containerContext.getProperties(['decimalField', 'decimalFieldLabel', 'rateDenotation',
                        'fieldPrecision', 'isDenotationPrefix', 'Required', 'Popup Error Message', 'Required Named Event', 'Not Required Named Event', 'Label Width']).then((propertyCollection) => {
                        this.setProperties(propertyCollection);
                        $('#defaultLabelText').text(this.decimalFieldLabel);
                        this.validateKeyPress();
                        if (this.isRequired) {
                            document.getElementById('defaultLabelText').classList.add('required');
                        }
                        const labelWidth = propertyCollection.get('Label Width').getValue();
                        document.getElementById('labelContainer').style.width = `${labelWidth}px`;
                        document.getElementById('inputError').style.display = 'none';
                        extensionProvider.registerWorkspaceExtension((workspaceRecord) => {
                            workspaceRecord.addRecordSavingListener(this.recordSaving);
                            workspaceRecord.addEditorLoadedListener(this.editorLoad);
                            workspaceRecord.addNamedEventListener(this.requiredEventName, this.requiredCallback);
                            workspaceRecord.addNamedEventListener(this.notRequiredEventName, this.notRequiredCallback);
                            workspaceRecord.getFieldValues([this.decimalField]).then((fieldDetails) => {
                                const decimalFieldDbValue = fieldDetails.getField(this.decimalField).getValue();
                                if (!decimalFieldDbValue) {
                                    this.initializeExtensionFieldValue(+decimalFieldDbValue);
                                }
                            });
                            this.updateDecimalDbField(workspaceRecord);
                        });
                    });
                });
            });
        });
    }
    // public registerWorkspaceCallback
    setProperties(propertyCollection) {
        this.decimalFieldLabel = propertyCollection.get('decimalFieldLabel').getValue();
        this.decimalField = propertyCollection.get('decimalField').getValue();
        this.rateDenotation = propertyCollection.get('rateDenotation').getValue();
        this.fieldPrecision = propertyCollection.get('fieldPrecision').getValue();
        this.isDenotationPrefix = propertyCollection.get('isDenotationPrefix').getValue();
        this.isRequired = propertyCollection.get('Required').getValue();
        this.invalidMessage = propertyCollection.get('Popup Error Message').getValue();
        this.requiredEventName = propertyCollection.get('Required Named Event').getValue();
        this.notRequiredEventName = propertyCollection.get('Not Required Named Event').getValue();
        this.fieldPrecision = +this.fieldPrecision;
    }
    initializeExtensionFieldValue(decimalFieldValue) {
        let defaultRateToDisplay = decimalFieldValue;
        if (this.fieldPrecision) {
            defaultRateToDisplay = decimalFieldValue / (Math.pow(10, this.fieldPrecision));
            defaultRateToDisplay = +defaultRateToDisplay.toFixed(this.fieldPrecision);
        }
        if (this.isDenotationPrefix) {
            $('#decimalInput').val(`${this.rateDenotation} ${defaultRateToDisplay}`);
        }
        else {
            $('#decimalInput').val(`${defaultRateToDisplay} ${this.rateDenotation}`);
        }
    }
    getFloatingCount(inputRate) {
        if (inputRate && inputRate.includes('.')) {
            return inputRate.split('.')[1].length;
        }
        return 0;
    }
    getExtensionProvider() {
        if (!this.extensionProviderPromise) {
            this.extensionProviderPromise = ORACLE_SERVICE_CLOUD.extension_loader.load('Currency Decimal Extension');
        }
        return this.extensionProviderPromise;
    }
    recordSaving(workspaceRecordEventParameter) {
        if (document.getElementById('decimalInput').value === '' && document.getElementById('defaultLabelText').classList.contains('required')) {
            document.getElementById('decimalInput').classList.add('invalid');
            document.getElementById('inputError').style.display = 'block';
            workspaceRecordEventParameter.getCurrentEvent().cancel();
        }
    }
    editorLoad() {
        document.getElementById('decimalInput').classList.remove('invalid');
        document.getElementById('inputError').style.display = 'none';
    }
    requiredCallback() {
        document.getElementById('defaultLabelText').classList.add('required');
    }
    notRequiredCallback() {
        document.getElementById('defaultLabelText').classList.remove('required');
        document.getElementById('decimalInput').classList.remove('invalid');
        document.getElementById('inputError').style.display = 'none';
    }
}
new DecimalCurrency();
