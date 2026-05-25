// 自动迁移自 China-Heritage 项目
// 60 条联合国教科文组织世界遗产名录（截至 2025 年）

export type HeritageCategory = '文化遗产' | '自然遗产' | '混合遗产'

export interface HeritageSite {
  id: string
  name: string
  category: HeritageCategory
  province: string
  yearInscribed: number
  description: string
  imageUrl: string
}

export const HERITAGE_SITES: HeritageSite[] = [
  {
    id: '1',
    name: '北京和沈阳的明清皇家宫殿',
    category: '文化遗产',
    province: '北京',
    yearInscribed: 1987,
    description: '“红墙宫里万重门，几代兴衰事已尘。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/故宫.png'
  },
  {
    id: '2',
    name: '秦始皇陵及兵马俑坑',
    category: '文化遗产',
    province: '陕西',
    yearInscribed: 1987,
    description: '“秦王扫六合，虎视何雄哉。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/兵马俑.png'
  },
  {
    id: '3',
    name: '长城',
    category: '文化遗产',
    province: '北京',
    yearInscribed: 1987,
    description: '“不到长城非好汉。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/长城.png'
  },
  {
    id: '4',
    name: '莫高窟',
    category: '文化遗产',
    province: '甘肃',
    yearInscribed: 1987,
    description: '“敦者，大也；煌者，盛也。一眼千年，梦回大唐。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/莫高窟.png'
  },
  {
    id: '5',
    name: '泰山',
    category: '混合遗产',
    province: '山东',
    yearInscribed: 1987,
    description: '“会当凌绝顶，一览众山小。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/泰山.png'
  },
  {
    id: '6',
    name: '周口店北京人遗址',
    category: '文化遗产',
    province: '北京',
    yearInscribed: 1987,
    description: '“远古足音，人类之源。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/北京猿人.png'
  },
  {
    id: '7',
    name: '黄山',
    category: '混合遗产',
    province: '安徽',
    yearInscribed: 1990,
    description: '“五岳归来不看山，黄山归来不看岳。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/黄山.png'
  },
  {
    id: '8',
    name: '九寨沟风景名胜区',
    category: '自然遗产',
    province: '四川',
    yearInscribed: 1992,
    description: '“九寨归来不看水，人间仙境若梦回。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/九寨沟.png'
  },
  {
    id: '9',
    name: '黄龙风景名胜区',
    category: '自然遗产',
    province: '四川',
    yearInscribed: 1992,
    description: '“圣地仙境，人间瑶池。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/黄龙.png'
  },
  {
    id: '10',
    name: '武陵源风景名胜区',
    category: '自然遗产',
    province: '湖南',
    yearInscribed: 1992,
    description: '“扩大的盆景，缩小的仙境。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/武陵源.png'
  },
  {
    id: '11',
    name: '承德避暑山庄及其周围寺庙',
    category: '文化遗产',
    province: '河北',
    yearInscribed: 1994,
    description: '“移天缩地在君怀，山庄巍巍帝王气。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/承德避暑山庄.png'
  },
  {
    id: '12',
    name: '曲阜孔庙、孔林和孔府',
    category: '文化遗产',
    province: '山东',
    yearInscribed: 1994,
    description: '“天不生仲尼，万古如长夜。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/孔庙.png'
  },
  {
    id: '13',
    name: '武当山古建筑群',
    category: '文化遗产',
    province: '湖北',
    yearInscribed: 1994,
    description: '“亘古无双胜境，天下第一仙山。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/武当山.png'
  },
  {
    id: '14',
    name: '拉萨布达拉宫历史建筑群',
    category: '文化遗产',
    province: '西藏',
    yearInscribed: 1994,
    description: '“住进布达拉宫，我是雪域最大的王。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/布达拉宫.png'
  },
  {
    id: '15',
    name: '庐山国家公园',
    category: '文化遗产',
    province: '江西',
    yearInscribed: 1996,
    description: '“不识庐山真面目，只缘身在此山中。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/庐山.png'
  },
  {
    id: '16',
    name: '峨眉山风景区及乐山大佛风景区',
    category: '混合遗产',
    province: '四川',
    yearInscribed: 1996,
    description: '“峨眉天下秀。山是一座佛，佛是一座山。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/峨眉山及乐山大佛.png'
  },
  {
    id: '17',
    name: '平遥古城',
    category: '文化遗产',
    province: '山西',
    yearInscribed: 1997,
    description: '“千年古城，晋商遗风。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/平遥古城.png'
  },
  {
    id: '18',
    name: '苏州古典园林',
    category: '文化遗产',
    province: '江苏',
    yearInscribed: 1997,
    description: '“江南园林甲天下，苏州园林甲江南。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/苏州园林.png'
  },
  {
    id: '19',
    name: '丽江古城',
    category: '文化遗产',
    province: '云南',
    yearInscribed: 1997,
    description: '“家家流水，户户垂杨。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/丽江古城.png'
  },
  {
    id: '20',
    name: '北京皇家园林－颐和园',
    category: '文化遗产',
    province: '北京',
    yearInscribed: 1998,
    description: '“虽由人作，宛自天开。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/颐和园.png'
  },
  {
    id: '21',
    name: '北京皇家祭坛－天坛',
    category: '文化遗产',
    province: '北京',
    yearInscribed: 1998,
    description: '“天圆地方，敬天法祖。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/天坛.png'
  },
  {
    id: '22',
    name: '大足石刻',
    category: '文化遗产',
    province: '重庆',
    yearInscribed: 1999,
    description: '“北敦南大，石刻瑰宝。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/大足石刻.png'
  },
  {
    id: '23',
    name: '武夷山',
    category: '混合遗产',
    province: '福建',
    yearInscribed: 1999,
    description: '“九曲溪山，理学渊源。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/武夷山.png'
  },
  {
    id: '24',
    name: '青城山－都江堰',
    category: '文化遗产',
    province: '四川',
    yearInscribed: 2000,
    description: '“拜水都江堰，问道青城山。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/都江堰.png'
  },
  {
    id: '25',
    name: '皖南古村落－西递、宏村',
    category: '文化遗产',
    province: '安徽',
    yearInscribed: 2000,
    description: '“中国画里的乡村，桃花源里人家。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/西递、宏村.png'
  },
  {
    id: '26',
    name: '龙门石窟',
    category: '文化遗产',
    province: '河南',
    yearInscribed: 2000,
    description: '“卢舍那佛笑千年，伊水东流不复回。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/龙门石窟寺.png'
  },
  {
    id: '27',
    name: '明清皇家陵寝',
    category: '文化遗产',
    province: '河北',
    yearInscribed: 2000,
    description: '“陵寝肃穆，帝王遗梦。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/明清皇家陵寝.png'
  },
  {
    id: '28',
    name: '云冈石窟',
    category: '文化遗产',
    province: '山西',
    yearInscribed: 2001,
    description: '“雕饰奇伟，冠于一世。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/云冈石窟.png'
  },
  {
    id: '29',
    name: '云南三江并流保护区',
    category: '自然遗产',
    province: '云南',
    yearInscribed: 2003,
    description: '“江水并流而不交，世界奇观。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/云南三江并流.png'
  },
  {
    id: '30',
    name: '高句丽王城、王陵及贵族墓葬',
    category: '文化遗产',
    province: '吉林',
    yearInscribed: 2004,
    description: '“东方金字塔，壁画艺术宝库。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/高句丽王城.png'
  },
  {
    id: '31',
    name: '澳门历史城区',
    category: '文化遗产',
    province: '澳门',
    yearInscribed: 2005,
    description: '“中西合璧，莲岛风韵。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/澳门大三巴.png'
  },
  {
    id: '32',
    name: '殷墟',
    category: '文化遗产',
    province: '河南',
    yearInscribed: 2006,
    description: '“一片甲骨惊天下。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/殷墟.png'
  },
  {
    id: '33',
    name: '四川大熊猫栖息地',
    category: '自然遗产',
    province: '四川',
    yearInscribed: 2006,
    description: '“活化石的最后家园。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/四川大熊猫繁育基地.png'
  },
  {
    id: '34',
    name: '中国南方喀斯特',
    category: '自然遗产',
    province: '云南',
    yearInscribed: 2007,
    description: '“造化钟神秀，石林天下奇。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/中国南方喀斯特.png'
  },
  {
    id: '35',
    name: '开平碉楼与村落',
    category: '文化遗产',
    province: '广东',
    yearInscribed: 2007,
    description: '“中西合璧，侨乡丰碑。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/开平碉楼.png'
  },
  {
    id: '36',
    name: '福建土楼',
    category: '文化遗产',
    province: '福建',
    yearInscribed: 2008,
    description: '“东方古城堡，世界建筑奇葩。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/福建土楼.png'
  },
  {
    id: '37',
    name: '三清山国家公园',
    category: '自然遗产',
    province: '江西',
    yearInscribed: 2008,
    description: '“揽胜遍五岳，绝景在三清。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/三清山.png'
  },
  {
    id: '38',
    name: '五台山',
    category: '文化遗产',
    province: '山西',
    yearInscribed: 2009,
    description: '“金五台，清凉界。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/五台山.png'
  },
  {
    id: '39',
    name: '“天地之中”历史建筑群',
    category: '文化遗产',
    province: '河南',
    yearInscribed: 2010,
    description: '“天下武功出少林。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/“天地之中”历史建筑群.png'
  },
  {
    id: '40',
    name: '中国丹霞',
    category: '自然遗产',
    province: '贵州',
    yearInscribed: 2010,
    description: '“色如渥丹，灿若明霞。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/中国丹霞.png'
  },
  {
    id: '41',
    name: '杭州西湖文化景观',
    category: '文化遗产',
    province: '浙江',
    yearInscribed: 2011,
    description: '“欲把西湖比西子，淡妆浓抹总相宜。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/西湖.png'
  },
  {
    id: '42',
    name: '元上都遗址',
    category: '文化遗产',
    province: '内蒙古',
    yearInscribed: 2012,
    description: '“草色天光，帝都遗梦。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/元上都遗址.png'
  },
  {
    id: '43',
    name: '澄江化石地',
    category: '自然遗产',
    province: '云南',
    yearInscribed: 2012,
    description: '“寒武纪的生命密码。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/澄江化石地.png'
  },
  {
    id: '44',
    name: '新疆天山',
    category: '自然遗产',
    province: '新疆',
    yearInscribed: 2013,
    description: '“明月出天山，苍茫云海间。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/新疆天山.png'
  },
  {
    id: '45',
    name: '红河哈尼梯田文化景观',
    category: '文化遗产',
    province: '云南',
    yearInscribed: 2013,
    description: '“大地的雕塑，云端的画卷。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/红河哈尼梯田.png'
  },
  {
    id: '46',
    name: '大运河',
    category: '文化遗产',
    province: '江苏',
    yearInscribed: 2014,
    description: '“尽道隋亡为此河，至今千里赖通波。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/大运河.png'
  },
  {
    id: '47',
    name: '丝绸之路：长安－天山廊道的路网',
    category: '文化遗产',
    province: '陕西',
    yearInscribed: 2014,
    description: '“劝君更尽一杯酒，西出阳关无故人。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/丝绸之路.png'
  },
  {
    id: '48',
    name: '土司遗址',
    category: '文化遗产',
    province: '湖南',
    yearInscribed: 2015,
    description: '“齐政修教，因俗而治。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/土司遗址.png'
  },
  {
    id: '49',
    name: '左江花山岩画文化景观',
    category: '文化遗产',
    province: '广西',
    yearInscribed: 2016,
    description: '“千古之谜，崖壁史书。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/左江花山岩画.png'
  },
  {
    id: '50',
    name: '湖北神农架',
    category: '自然遗产',
    province: '湖北',
    yearInscribed: 2016,
    description: '“野人传说，原始秘境。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/湖北神农架.png'
  },
  {
    id: '51',
    name: '青海可可西里',
    category: '自然遗产',
    province: '青海',
    yearInscribed: 2017,
    description: '“万山之祖，生灵天堂。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/可可西里.png'
  },
  {
    id: '52',
    name: '鼓浪屿：历史国际社区',
    category: '文化遗产',
    province: '福建',
    yearInscribed: 2017,
    description: '“琴声悠扬，海上花园。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/鼓浪屿.png'
  },
  {
    id: '53',
    name: '梵净山',
    category: '自然遗产',
    province: '贵州',
    yearInscribed: 2018,
    description: '“天空之城，梵天净土。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/梵净山.png'
  },
  {
    id: '54',
    name: '良渚古城遗址',
    category: '文化遗产',
    province: '浙江',
    yearInscribed: 2019,
    description: '“中华文明，上下五千年。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/良渚遗址.png'
  },
  {
    id: '55',
    name: '中国黄（渤）海候鸟栖息地（第一期）',
    category: '自然遗产',
    province: '江苏',
    yearInscribed: 2019,
    description: '“落霞与孤鹜齐飞，秋水共长天一色。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/黄渤海候鸟栖息地.png'
  },
  {
    id: '56',
    name: '泉州：宋元中国的世界海洋商贸中心',
    category: '文化遗产',
    province: '福建',
    yearInscribed: 2021,
    description: '“涨海声中万国商。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/泉州.png'
  },
  {
    id: '57',
    name: '普洱景迈山古茶林文化景观',
    category: '文化遗产',
    province: '云南',
    yearInscribed: 2023,
    description: '“千年茶林，世界茶源。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/景迈普洱.png'
  },
  {
    id: '58',
    name: '巴丹吉林沙漠－沙山湖泊群',
    category: '自然遗产',
    province: '内蒙古',
    yearInscribed: 2024,
    description: '“大漠孤烟，上帝画下的曲线。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/巴丹吉林沙漠－沙山湖泊群.png'
  },
  {
    id: '59',
    name: '北京中轴线——中国理想都城秩序的杰作',
    category: '文化遗产',
    province: '北京',
    yearInscribed: 2024,
    description: '“中正和谐，国之脊梁。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/北京中轴线.png'
  },
  {
    id: '60',
    name: '西夏陵',
    category: '文化遗产',
    province: '宁夏',
    yearInscribed: 2025,
    description: '“神秘西夏，东方金字塔。”',
    imageUrl: 'https://raw.githubusercontent.com/stevenfake010/nice-heritage-in-china/main/img/西夏陵.png'
  }
];
