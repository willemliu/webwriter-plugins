import {Tool} from 'substance';
import {api} from 'writer';
//import {$} from 'substance';

export default class QuoteTool extends Tool {
  triggerInsert() {
    //this.getCommand().insertQuote("", "");
    // removing breaks in order to show the plugin's placeholder
    // until Substance makes this substance/ui/annotatedTextComponent.js line:94
    // configurable. When adding a plugin and saving it blank, the br will be there
    // on render though.
    // TODO: fix this.
    //$(".sc-text-property").find('br').remove();
    api.editorSession.executeCommand('quote');
  }

  render($$) {
    var el = $$('button').addClass('se-tool').append(
      $$('i').addClass('fa fa-quote-left')
    ).on('click', this.triggerInsert);
    return el;
  }

}