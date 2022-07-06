/// <reference path = "../libs/osvcExtension.d.ts"/>

class DecimalCurrency {
  private extensionProviderPromise: IExtensionPromise<IExtensionProvider>;
  private decimalFieldLabel: string;
  private decimalField: string;
  private rateDenotation: string;
  private fieldPrecision: number;
  private isDenotationPrefix: boolean;
  private isRequired: boolean;
  private invalidMessage: string;
  private requiredEventName: string;
  private notRequiredEventName: string;

  constructor() {
    this.registerExtensions();
  }

  public updateDecimalDbField(workspaceRecord: IWorkspaceRecord): void {
    document.getElementById('decimalInput').addEventListener('blur', (blurEvent) => {
      const fieldValue: string = this.formatFieldValue(blurEvent);
      workspaceRecord.updateField(this.decimalField, fieldValue);
    });
  }

  public formatFieldValue(blurEvent): string {
    let content: string = blurEvent.target.value;
    if (!content) {
      return '';
    }
    content = this.stripRateDenotation(content);
    content = (+content).toFixed(this.fieldPrecision);
    this.updateDisplayField(content);
    const contentCorrected = Math.round(+content * (Math.pow(10, this.fieldPrecision)));
    return contentCorrected.toString();
  }

  public updateDisplayField(inputValue): void {
    if (this.isDenotationPrefix === true) {
      $('#decimalInput').val(`${this.rateDenotation } ${ inputValue}`);
    } else {
      $('#decimalInput').val(`${inputValue } ${ this.rateDenotation}`);
    }
  }

  public validateKeyPress(): void {
    document.getElementById('decimalInput').addEventListener('keypress', (keypressEvent) => {
      this.validateKey(keypressEvent);
    });
    document.getElementById('decimalInput').addEventListener('change', (changeEvent) => {
      this.removeErrorLabel(changeEvent);
    });
  }

  public removeErrorLabel(changeEvent): void {
    const content: string = changeEvent.target.value;
    if (content !== '') {
      document.getElementById('decimalInput').classList.remove('invalid');
      document.getElementById('inputError').style.display = 'none';
    }
  }

  public validateKey(keypressEvent): boolean {
    let content: string = keypressEvent.target.value;
    const input: any = keypressEvent.key;
    const insertedCharPosition: number = keypressEvent.target.selectionEnd;

    if (this.checkValidation(input, content, insertedCharPosition)) {
      return true;
    }
    content = this.stripRateDenotation(content);
    const decimalCount: number = this.getFloatingCount(content);
    if (this.checkInvalidValue(input, decimalCount, keypressEvent)) {
      return false;
    }
  }

  public checkValidation(input: any, content: string, insertedCharPosition: number): boolean {
    if (input.length > 1 || this.checkDenotationAndPeriodIndex(input, content)) {
      return true;
    }
    const floatingPointPosition = content.indexOf('.');
    if (insertedCharPosition <= floatingPointPosition && !isNaN(input)) {
      return true;
    }
    return false;
  }

  public checkDenotationAndPeriodIndex(input: any, content: string) {
    if ((input === this.rateDenotation && content.indexOf(this.rateDenotation) === -1) || (input === '.' && content.indexOf('.') === -1)) {
      return true;
    }
    return false;
  }

  public checkInvalidValue(input: any, decimalCount: number, event): boolean {
    if (isNaN(input) || (decimalCount >= this.fieldPrecision)) {
      event.preventDefault();
      this.showErrorPopUp();
      return true;
    }
    return false;
  }

  public showErrorPopUp() {
    this.getExtensionProvider().then((extensionProvider: IExtensionProvider) => {
      extensionProvider.registerUserInterfaceExtension((userInterfaceContext: IUserInterfaceContext) => {
        userInterfaceContext.getPopupWindowContext().then((popupWindowContext: IPopupWindowContext) => {
          const popupWindow: IPopupWindow = popupWindowContext.createPopupWindow('errorPopupWindow');
          popupWindow.setContentUrl(`./alert.html?alertMessage=${this.invalidMessage}`);
          popupWindow.setTitle('Invalid input');
          popupWindow.render();
        });
      });
    });
  }

  public stripRateDenotation(content: string): string {
    if (this.isDenotationPrefix) {
      if (content.substring(0, this.rateDenotation.length) === this.rateDenotation) {
        content = content.substring(this.rateDenotation.length);
      }
    } else {
      const index: number = content.length - this.rateDenotation.length;
      if (content.substring(index, content.length) === this.rateDenotation) {
        content = content.substring(0, content.length - this.rateDenotation.length);
      }
    }
    return content;
  }

  public registerExtensions() {
    this.getExtensionProvider().then((extensionProvider: IExtensionProvider) => {
      extensionProvider.getGlobalContext().then((globalContext: IExtensionGlobalContext) => {
        globalContext.getContainerContext().then((containerContext: IContainerContext) => {
          containerContext.getProperties(['decimalField', 'decimalFieldLabel', 'rateDenotation',
            'fieldPrecision', 'isDenotationPrefix', 'Required', 'Popup Error Message', 'Required Named Event', 'Not Required Named Event', 'Label Width']).then((propertyCollection: IExtensionPropertyCollection) => {
            this.setProperties(propertyCollection);


            $('#defaultLabelText').text(this.decimalFieldLabel);
            this.validateKeyPress();
            if (this.isRequired) {
              document.getElementById('defaultLabelText').classList.add('required');
            }
            const labelWidth = propertyCollection.get('Label Width').getValue();
            document.getElementById('labelContainer').style.width = `${labelWidth}px`;
            document.getElementById('inputError').style.display = 'none';
            extensionProvider.registerWorkspaceExtension((workspaceRecord: IWorkspaceRecord) => {
              workspaceRecord.addRecordSavingListener(this.recordSaving);
              workspaceRecord.addEditorLoadedListener(this.editorLoad);
              workspaceRecord.addNamedEventListener(this.requiredEventName, this.requiredCallback);
              workspaceRecord.addNamedEventListener(this.notRequiredEventName, this.notRequiredCallback);
              workspaceRecord.getFieldValues([this.decimalField]).then((fieldDetails: ORACLE_SERVICE_CLOUD.IFieldDetails) => {
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

  public setProperties(propertyCollection: IExtensionPropertyCollection): void {
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

  private initializeExtensionFieldValue(decimalFieldValue: number) {
    let defaultRateToDisplay = decimalFieldValue;
    if (this.fieldPrecision) {
      defaultRateToDisplay = decimalFieldValue / (Math.pow(10, this.fieldPrecision));
      defaultRateToDisplay = +defaultRateToDisplay.toFixed(this.fieldPrecision);
    }
    if (this.isDenotationPrefix) {
      $('#decimalInput').val(`${this.rateDenotation } ${ defaultRateToDisplay}`);
    } else {
      $('#decimalInput').val(`${defaultRateToDisplay } ${ this.rateDenotation}`);
    }
  }

  public getFloatingCount(inputRate: any): number {
    if (inputRate && inputRate.includes('.')) {
      return inputRate.split('.')[1].length;
    }
    return 0;
  }

  public getExtensionProvider(): IExtensionPromise<IExtensionProvider> {
    if (!this.extensionProviderPromise) {
      this.extensionProviderPromise = ORACLE_SERVICE_CLOUD.extension_loader.load('Currency Decimal Extension');
    }
    return this.extensionProviderPromise;
  }

  public recordSaving(workspaceRecordEventParameter: IWorkspaceRecordEventParameter): void {
    if ((document.getElementById('decimalInput') as HTMLInputElement).value === '' && document.getElementById('defaultLabelText').classList.contains('required')) {
      document.getElementById('decimalInput').classList.add('invalid');
      document.getElementById('inputError').style.display = 'block';
      workspaceRecordEventParameter.getCurrentEvent().cancel();
    }
  }

  public editorLoad(): void {
    document.getElementById('decimalInput').classList.remove('invalid');
    document.getElementById('inputError').style.display = 'none';
  }

  public requiredCallback(): void {
    document.getElementById('defaultLabelText').classList.add('required');
  }

  public notRequiredCallback(): void {
    document.getElementById('defaultLabelText').classList.remove('required');
    document.getElementById('decimalInput').classList.remove('invalid');
    document.getElementById('inputError').style.display = 'none';
  }
}

new DecimalCurrency();
