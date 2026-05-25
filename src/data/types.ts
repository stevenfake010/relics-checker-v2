export type Era =
  | 'prehistoric'
  | 'shangzhou'
  | 'chunqiu'
  | 'qinhan'
  | 'weijin'
  | 'suitang'
  | 'songyuan'
  | 'mingqing'

export type Cat =
  | 'bronze'
  | 'ceramics'
  | 'painting'
  | 'gold'
  | 'jade'
  | 'textile'
  | 'lacquer'
  | 'stone'
  | 'bamboo'
  | 'other'

export interface Exhibition {
  year: number | '常设'
  venue: string
  show: string
}

export interface Relic {
  id: number
  name: string
  era: Era
  cat: Cat
  location: string
  desc: string
  exhibitions?: Exhibition[]
  noPublicDisplay?: boolean
}
