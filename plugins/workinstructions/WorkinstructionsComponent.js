'use strict';

var Component = require('substance/ui/Component');
var TextProperty = require('substance/ui/TextPropertyComponent');
var $$ = Component.$$;
var Icon = require('substance/ui/FontAwesomeIcon');

function WorkinstructionsComponent() {
    Component.apply(this, arguments);
}

WorkinstructionsComponent.Prototype = function() {
    this.render = function() {
        var el = $$('a').append([
            $$('div').addClass('header').append([
                $$('span').addClass('remove-button').append(
                    $$(Icon, {icon: 'fa-remove'})
                ).on('click', this.removeWorkinstructions).attr('title', this.context.i18n.t('Remove from article')),
                $$('span').addClass('edit-button').append(
                    $$(Icon, {icon: 'fa-pencil-square-o'})
                ).on('click', this.editWorkinstructions).attr('title', this.context.i18n.t('Edit'))
            ]),
            $$(TextProperty, {
                tagName: 'div',
                path: [this.props.node.id, 'text']
            })
        ])
        .addClass('im-embedhtml')
        .attr('contentEditable', false);

        this.context.api.handleDrag(
            el,
            this.props.node
        );

        return el;
    };

    this.removeWorkinstructions = function() {
        this.context.api.deleteNode('workinstructions', this.props.node);
    };

    this.editWorkinstructions = function() {
        this.context.api.showDialog(
            require('./WorkinstructionsEditTool'),
            {
                text: this.props.node.text,
                update: function(text) {
                    this.props.doc.set([this.props.node.id, 'text'], text);
                }.bind(this)
            },
            {
                title: "Embed HTML"
            }
        );
    };
};

Component.extend(WorkinstructionsComponent);

module.exports = WorkinstructionsComponent;
