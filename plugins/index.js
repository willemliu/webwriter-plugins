import DoNotIndex from './nl.fdmg.donotindex/index'
import FDPersonal from './nl.fdmg.fdpersonal/index'
import ShowRelatedArticles from './nl.fdmg.showrelatedarticles/index'
import Paywall from './nl.fdmg.paywall/index'
import Topstory from './nl.fdmg.topstory/index'

import Section from './nl.fdmg.section/index'
import Genre from './nl.fdmg.genre/index'
import Rubric from './nl.fdmg.rubric/index'

(() => {
  DoNotIndex()
  FDPersonal()
  ShowRelatedArticles()
  Paywall()
  Topstory()
  
  Section()
  Genre()
  Rubric()
})()