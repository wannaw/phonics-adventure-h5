window.KidsExtensionData = {
  ipa: [
    // 传统英式教学音标。音标不含斜线，pattern 对应现有录音键。
    { id: 'v-long-i', symbol: 'iː', group: '元音', section: '长元音', cue: '唇角略向两边展开，舌前部抬高，声音拉长。', examples: ['sheep', 'green'] },
    { id: 'v-long-a', symbol: 'ɑː', group: '元音', section: '长元音', cue: '嘴巴张大，舌头放低并略向后，声音拉长。', examples: ['car', 'park'] },
    { id: 'v-long-o', symbol: 'ɔː', group: '元音', section: '长元音', cue: '双唇拢圆，舌后部抬起，声音拉长。', examples: ['saw', 'door'] },
    { id: 'v-long-u', symbol: 'uː', group: '元音', section: '长元音', cue: '双唇收圆，舌身抬高，声音拉长。', examples: ['moon', 'food'], pattern: 'u_e', variant: 1 },
    { id: 'v-nurse', symbol: 'ɜː', group: '元音', section: '长元音', cue: '双唇放松，舌中部微抬，保持口形拉长。', examples: ['bird', 'shirt'] },

    { id: 'v-short-i', symbol: 'ɪ', group: '元音', section: '短元音', cue: '舌前部稍抬，双唇放松，短促发声。', examples: ['sit', 'pig'], pattern: 'i' },
    { id: 'v-short-e', symbol: 'e', group: '元音', section: '短元音', cue: '嘴巴微张，舌前部抬起，短促发声。', examples: ['bed', 'pen'] },
    { id: 'v-short-a', symbol: 'æ', group: '元音', section: '短元音', cue: '下巴放低，嘴张大，舌前部略抬。', examples: ['cat', 'bag'], pattern: 'a' },
    { id: 'v-short-u', symbol: 'ʌ', group: '元音', section: '短元音', cue: '嘴巴自然张开，舌身稍低，短促发声。', examples: ['sun', 'cup'], pattern: 'u' },
    { id: 'v-short-o', symbol: 'ɒ', group: '元音', section: '短元音', cue: '嘴张开，双唇稍圆，舌后部放低。', examples: ['hot', 'sock'] },
    { id: 'v-foot', symbol: 'ʊ', group: '元音', section: '短元音', cue: '双唇略圆，舌身稍抬，轻快地发短音。', examples: ['book', 'foot'] },
    { id: 'v-schwa', symbol: 'ə', group: '元音', section: '短元音', cue: '舌头和双唇都放松，在非重读音节轻轻发声。', examples: ['about', 'sofa'] },

    { id: 'v-face', symbol: 'eɪ', group: '元音', section: '双元音', cue: '从 /e/ 滑向 /ɪ/，下巴逐渐抬起。', examples: ['cake', 'name'], pattern: 'a_e' },
    { id: 'v-price', symbol: 'aɪ', group: '元音', section: '双元音', cue: '先张大嘴，再平滑过渡到 /ɪ/。', examples: ['bike', 'kite'], pattern: 'i_e' },
    { id: 'v-choice', symbol: 'ɔɪ', group: '元音', section: '双元音', cue: '先把双唇拢圆，再朝 /ɪ/ 展开。', examples: ['boy', 'toy'] },
    { id: 'v-goat', symbol: 'əʊ', group: '元音', section: '双元音', cue: '从放松的 /ə/ 滑向 /ʊ/，双唇渐圆。', examples: ['home', 'nose'] },
    { id: 'v-mouth', symbol: 'aʊ', group: '元音', section: '双元音', cue: '先张大嘴，再收圆双唇滑向 /ʊ/。', examples: ['cow', 'house'] },
    { id: 'v-near', symbol: 'ɪə', group: '元音', section: '双元音', cue: '从 /ɪ/ 滑向轻短的 /ə/，双唇逐渐放松。', examples: ['ear', 'near'] },
    { id: 'v-square', symbol: 'eə', group: '元音', section: '双元音', cue: '从 /e/ 滑向放松的 /ə/，舌头退回中间。', examples: ['hair', 'chair'] },
    { id: 'v-cure', symbol: 'ʊə', group: '元音', section: '双元音', cue: '从略圆的 /ʊ/ 滑向放松的 /ə/，有些英式口音读成 /ɔː/。', examples: ['cure', 'pure'] },

    { id: 'c-p', symbol: 'p', group: '辅音', section: '爆破音', cue: '双唇闭紧后突然张开，送出一小股气。', examples: ['pig', 'pen'], pattern: 'p' },
    { id: 'c-b', symbol: 'b', group: '辅音', section: '爆破音', cue: '双唇闭合后迅速张开，声带振动。', examples: ['bat', 'bed'], pattern: 'b' },
    { id: 'c-t', symbol: 't', group: '辅音', section: '爆破音', cue: '舌尖抵上齿龈，再迅速放开送气。', examples: ['top', 'ten'], pattern: 't' },
    { id: 'c-d', symbol: 'd', group: '辅音', section: '爆破音', cue: '舌尖抵上齿龈，再迅速放开，声带振动。', examples: ['dog', 'door'] },
    { id: 'c-k', symbol: 'k', group: '辅音', section: '爆破音', cue: '舌后部先贴软腭，再迅速离开送气。', examples: ['cat', 'cup'], pattern: 'c' },
    { id: 'c-g', symbol: 'ɡ', group: '辅音', section: '爆破音', cue: '舌后部先贴软腭，再迅速离开，声带振动。', examples: ['go', 'game'] },

    { id: 'c-f', symbol: 'f', group: '辅音', section: '摩擦音', cue: '上齿轻贴下唇，让气流擦过，声带不振动。', examples: ['fish', 'fan'] },
    { id: 'c-v', symbol: 'v', group: '辅音', section: '摩擦音', cue: '上齿轻贴下唇，让气流擦过，同时振动声带。', examples: ['van', 'vest'] },
    { id: 'c-thin', symbol: 'θ', group: '辅音', section: '摩擦音', cue: '舌尖轻放在两排牙齿之间，轻送气。', examples: ['thin', 'thumb'], pattern: 'th' },
    { id: 'c-this', symbol: 'ð', group: '辅音', section: '摩擦音', cue: '舌尖轻放在两排牙齿之间，同时振动声带。', examples: ['this', 'that'] },
    { id: 'c-s', symbol: 's', group: '辅音', section: '摩擦音', cue: '舌尖靠近上齿龈，让气流从细缝穿过。', examples: ['sun', 'sip'], pattern: 's' },
    { id: 'c-z', symbol: 'z', group: '辅音', section: '摩擦音', cue: '摆出 /s/ 的舌位，让气流通过，同时振动声带。', examples: ['zoo', 'zip'] },
    { id: 'c-sh', symbol: 'ʃ', group: '辅音', section: '摩擦音', cue: '舌前部靠近上齿龈后方，双唇略圆，轻送气。', examples: ['ship', 'fish'], pattern: 'sh' },
    { id: 'c-vision', symbol: 'ʒ', group: '辅音', section: '摩擦音', cue: '摆出 /ʃ/ 的舌位，让气流通过，同时振动声带。', examples: ['vision', 'measure'] },
    { id: 'c-h', symbol: 'h', group: '辅音', section: '摩擦音', cue: '喉部放松，好像对玻璃轻轻呵气。', examples: ['hat', 'hen'] },
    { id: 'c-r', symbol: 'r', group: '辅音', section: '无摩擦延续音', cue: '舌尖抬向上齿龈后方，留出空隙，舌尖不颤动。', examples: ['red', 'rain'] },

    { id: 'c-ch', symbol: 'tʃ', group: '辅音', section: '破擦音', cue: '在上齿龈后方先堵住气流，再放开一点形成摩擦。', examples: ['chip', 'chin'], pattern: 'ch' },
    { id: 'c-jam', symbol: 'dʒ', group: '辅音', section: '破擦音', cue: '像发 /tʃ/ 一样先堵后放，声带同时振动。', examples: ['jam', 'jump'] },
    { id: 'c-tr', symbol: 'tr', group: '辅音', section: '辅音组合', cue: '发 /t/ 后立刻接 /r/，中间不加元音。', examples: ['tree', 'train'] },
    { id: 'c-dr', symbol: 'dr', group: '辅音', section: '辅音组合', cue: '发 /d/ 后立刻接 /r/，中间不加元音。', examples: ['drum', 'dress'] },
    { id: 'c-ts', symbol: 'ts', group: '辅音', section: '辅音组合', cue: '舌尖放开 /t/ 后立刻接 /s/，气流连着走。', examples: ['cats', 'hats'] },
    { id: 'c-dz', symbol: 'dz', group: '辅音', section: '辅音组合', cue: '舌尖放开 /d/ 后立刻接 /z/，保持声音连贯。', examples: ['beds', 'hands'] },

    { id: 'c-m', symbol: 'm', group: '辅音', section: '鼻音', cue: '闭上双唇，让声音从鼻腔出来。', examples: ['map', 'mud'], pattern: 'm' },
    { id: 'c-n', symbol: 'n', group: '辅音', section: '鼻音', cue: '舌尖抵住上齿龈，让声音从鼻腔出来。', examples: ['net', 'nose'] },
    { id: 'c-ng', symbol: 'ŋ', group: '辅音', section: '鼻音', cue: '舌后部贴住软腭，用鼻腔发声，收尾不加 /ɡ/。', examples: ['sing', 'ring'], pattern: 'ng' },
    { id: 'c-l', symbol: 'l', group: '辅音', section: '舌侧音', cue: '舌尖抵住上齿龈，让气流从舌头两侧通过。', examples: ['leg', 'leaf'] },
    { id: 'c-y', symbol: 'j', group: '辅音', section: '半元音', cue: '舌前部靠近硬腭，迅速滑向后面的元音。', examples: ['yes', 'yellow'] },
    { id: 'c-w', symbol: 'w', group: '辅音', section: '半元音', cue: '先收圆双唇，再迅速张开滑向后面的元音。', examples: ['when', 'whip'], pattern: 'wh' }
  ],

  pictureUnits: [
    {
      id: 'animals', title: '动物朋友', categories: [
        { id: 'pets', title: '小宠物', icon: '🐾', words: [
          { word: 'cat', meaning: '猫', icon: '🐱', sentence: 'The cat sleeps on my bed.' },
          { word: 'dog', meaning: '狗', icon: '🐶', sentence: 'My dog has a red ball.' },
          { word: 'fish', meaning: '鱼', icon: '🐟', sentence: 'The fish swims in the tank.' },
          { word: 'rabbit', meaning: '兔子', icon: '🐰', sentence: 'The rabbit has long ears.' }
        ] },
        { id: 'farm', title: '农场动物', icon: '🚜', words: [
          { word: 'hen', meaning: '母鸡', icon: '🐔', sentence: 'The hen sits on an egg.' },
          { word: 'pig', meaning: '猪', icon: '🐷', sentence: 'The pig rolls in the mud.' },
          { word: 'duck', meaning: '鸭子', icon: '🦆', sentence: 'A duck swims by the farm.' },
          { word: 'sheep', meaning: '绵羊', icon: '🐑', sentence: 'I see a sheep in the field.' }
        ] }
      ]
    },
    {
      id: 'food', title: '我的餐盘', categories: [
        { id: 'fruit', title: '水果', icon: '🍎', words: [
          { word: 'apple', meaning: '苹果', icon: '🍎', sentence: 'I cut the apple in half.' },
          { word: 'pear', meaning: '梨', icon: '🍐', sentence: 'This pear is green.' },
          { word: 'banana', meaning: '香蕉', icon: '🍌', sentence: 'I peel a banana for a snack.' },
          { word: 'grapes', meaning: '葡萄', icon: '🍇', sentence: 'The grapes are sweet.' }
        ] },
        { id: 'breakfast', title: '早餐', icon: '🍳', words: [
          { word: 'egg', meaning: '鸡蛋', icon: '🥚', sentence: 'I crack an egg into a bowl.' },
          { word: 'bread', meaning: '面包', icon: '🍞', sentence: 'We share a slice of bread.' },
          { word: 'milk', meaning: '牛奶', icon: '🥛', sentence: 'I drink milk from a cup.' },
          { word: 'jam', meaning: '果酱', icon: '🫙', sentence: 'I put jam on my toast.' }
        ] }
      ]
    },
    {
      id: 'everyday', title: '身边的物品', categories: [
        { id: 'school-kit', title: '学习用品', icon: '🎒', words: [
          { word: 'pen', meaning: '笔', icon: '🖊️', sentence: 'I write my name with a pen.' },
          { word: 'pencil', meaning: '铅笔', icon: '✏️', sentence: 'I draw a sun with my pencil.' },
          { word: 'book', meaning: '书', icon: '📘', sentence: 'We read a book about frogs.' },
          { word: 'bag', meaning: '包', icon: '🎒', sentence: 'My lunch is in my bag.' }
        ] },
        { id: 'home', title: '家里物品', icon: '🏠', words: [
          { word: 'bed', meaning: '床', icon: '🛏️', sentence: 'I make my bed in the morning.' },
          { word: 'chair', meaning: '椅子', icon: '🪑', sentence: 'Pull up a chair and sit with me.' },
          { word: 'door', meaning: '门', icon: '🚪', sentence: 'Please shut the door.' },
          { word: 'clock', meaning: '时钟', icon: '🕒', sentence: 'The clock says three.' }
        ] }
      ]
    },
    {
      id: 'outdoors', title: '一起出门', categories: [
        { id: 'transport', title: '交通工具', icon: '🚌', words: [
          { word: 'bus', meaning: '公共汽车', icon: '🚌', sentence: 'We wait for the bus.' },
          { word: 'car', meaning: '小汽车', icon: '🚗', sentence: 'Dad washes the car.' },
          { word: 'train', meaning: '火车', icon: '🚆', sentence: 'The train stops at the station.' },
          { word: 'bike', meaning: '自行车', icon: '🚲', sentence: 'I ride my bike in the park.' }
        ] },
        { id: 'sky', title: '仰望天空', icon: '🌤️', words: [
          { word: 'sun', meaning: '太阳', icon: '☀️', sentence: 'The sun warms my face.' },
          { word: 'moon', meaning: '月亮', icon: '🌙', sentence: 'We can see the moon tonight.' },
          { word: 'cloud', meaning: '云', icon: '☁️', sentence: 'That cloud looks like a bear.' },
          { word: 'rain', meaning: '雨', icon: '🌧️', sentence: 'I hear the rain on the roof.' }
        ] }
      ]
    }
  ]
};
