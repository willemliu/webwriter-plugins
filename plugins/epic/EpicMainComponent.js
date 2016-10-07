'use strict';

var Component = require('substance/ui/Component');
var $$ = Component.$$;
var jQuery = require('substance/util/jquery');
var Icon = require('substance/ui/FontAwesomeIcon');
var SearchComponent = require('vendor/nl.fdmg/universalsearch/UniversalSearchComponent');
var genUUID = require('writer/utils/IdGenerator');

function EpicMainComponent() {
  EpicMainComponent.super.apply(this, arguments);
  this.name = 'epic';
}

EpicMainComponent.Prototype = function() {

  this.getInitialState = function() {
    return {
      existingEpic: this.getExistingEpic()
    };
  };

  this.render = function() {

    var existingEpic = this.state.existingEpic;
    var epicEl = $$('span');

    if (existingEpic) {
      epicEl = $$('div')
        .append(
          $$('div')
            .addClass('metadata__container')
            .append(
              $$('span')
              .addClass('epic__name notClickable meta')
              .append(existingEpic.name)
            ),
          $$('div')
            .addClass('button__container')
            .append(
              $$('button')
              .addClass('author__button--delete')
              .append($$(Icon, { icon: 'fa-times' }))
              .on('click', function() { this.removeEpic(); }.bind(this))
            )
        );
    }

    return $$('div')
      .ref('epicContainer')
      .addClass('epic')
      .append(
        $$('h2').append(this.context.i18n.t('Epic')),
        epicEl,
        $$(SearchComponent, {
          existingItems: existingEpic ? [existingEpic] : [],
          doSearch: this.searchEpics.bind(this),
          onSelect: this.setEpic.bind(this),
          createAllowed: false,
          placeholderText: "Set Epic"
        }).ref('epicSearchComponent'),
        $$('hr')
      );
  };

  this.reloadEpic = function() {
    this.extendState({
      existingEpic: this.getExistingEpic()
    });
  };

  this.getExistingEpic = function() {
    var links = this.context.api.getLinkByType(this.name, 'fdmg/epic');
    var epic = links.pop();

    if (!!epic) {
      return {
        id: epic['@id'],
        name: epic['@name']
      };
    }

    return null;
  };

  this.searchEpics = function(q, cb) {
    var endpoint = this.context.api.getConfigValue(this.name, 'endpoint');

    this.extendState({ isSearching: true });

    jQuery.ajax(endpoint + q, { data: { dataType: 'json' } })
      .done(function(items) {

        var epics = items.slice(0, 100).map(function(epic) {
          return {
            name: epic.title,
            id: epic.id
          }
        });

        cb(null, epics);
      }.bind(this))
      .fail(function(data, status, err) { console.error(err); cb(err, null); })
      .always(function() { this.extendState({ isSearching: false }); }.bind(this));
  };

  this.setEpic = function(epic) {
    this.removeEpic();

    this.context.api.addLink(this.name, {
      '@rel': this.name,
      '@type': 'fdmg/epic',
      '@id': epic.id,
      '@name': epic.name,
      '@uuid': genUUID()
    });

    this.reloadEpic();
  };

  this.removeEpic = function(epic) {
    this.context.api.getLinkByType(this.name, 'fdmg/epic')
      .forEach(function(epic) {
        this.context.api.removeLinkByUUIDAndRel(this.name, epic['@uuid'], epic['@rel']);
      }.bind(this));

    this.reloadEpic();
  };
}

Component.extend(EpicMainComponent);
module.exports = EpicMainComponent;
