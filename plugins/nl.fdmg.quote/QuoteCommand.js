import {Command} from 'substance';

export default class QuoteCommand extends Command {
  getCommandState(params) {
    if (!params) return

    var sel = params.selection
    var newState = {
      disabled: true,
      active: false
    };

    if (sel && !sel.isNull() && sel.isPropertySelection()) {
      newState.disabled = false;
    }

    return newState;
  }

  insertQuote(quoteMessage, quoteAuthor) {
    var state = this.getCommandState();
    console.info('Added quote "' + quoteMessage + '" with author: "' + quoteAuthor + '" to document');
    if (state.disabled) {
      return;
    }
    var data = {
      type: 'quote',
      contentType: 'fdmg/quote',
      message: quoteMessage,
      author: quoteAuthor,
      data: {
        type: 'quote',
        'data-type': 'quote'
      }
    };

    return this.context.api.insertBlockNode(data.type, data);
  }

}