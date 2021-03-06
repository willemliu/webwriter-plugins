'use strict'

const Component = require('substance/ui/Component')
const Dropdown = require('vendor/nl.fdmg/dropdown/DropdownComponent')
const $$ = Component.$$
const $ = require('substance/util/jquery')
const genUuid = require('writer/utils/IdGenerator')

function GenreComponent() {
  GenreComponent.super.apply(this, arguments)
}

GenreComponent.Prototype = function() {

  this.getInitialState = function() {
    return {
      items: this.context.api.getConfigValue('genre', 'genrelist')
    }
  }

  this.render = function() {
    const name = `genre`
    const type = `fdmg/${name}`

    const api = this.context.api

    const initialSelection = api
      .getLinkByType(name, type)
      .map((link) => {return {id: link['@id'], label: link['@title']}})
      .pop()

    return $$('div')
      .addClass('fdmg-sidebar')
      .append(
        $$(Dropdown, {
          onSelect: (item) => {
            api
              .getLinkByType(name, type)
              .forEach((link) => api.removeLinkByUUIDAndRel(name, link['@uuid'], link['@rel']))

            if (item.id != 'none' && item.label.trim() != '') {
              api.addLink(name, {
                '@rel': name,
                '@type': type,
                '@id': item.id,
                '@title': item.label,
                '@uuid': genUuid()
              })
            }
          },
          header: this.context.i18n.t('Genre'),
          items: this.state.items,
          allowFreeInput: true,
          allowEmptySelection: true,
          initialSelection: initialSelection
        }),
        $$('hr')
      )
  }
}

Component.extend(GenreComponent)
module.exports = GenreComponent
