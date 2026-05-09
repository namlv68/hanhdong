import React, { useState, useEffect } from 'react';
import { Camera, Users, Sword, Zap, Copy, Check, Clock, Flame, ChevronUp, ChevronDown, MonitorPlay, Star, Search, Shirt, ShoppingBag, Key, Link, Settings, Download } from 'lucide-react';
import { executeAiWithFallback } from './aiService';

const loadSavedState = () => {
  try {
    const saved = localStorage.getItem('actionAppState');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error("Lỗi parse saved state:", e);
  }
  return {};
};

const App = () => {
  const savedState = loadSavedState();
  const [numCharacters, setNumCharacters] = useState<number>(savedState.numCharacters ?? 1);
  const [outfitMode, setOutfitMode] = useState<string>(savedState.outfitMode ?? 'Cameo');
  const [settingMode, setSettingMode] = useState<string>(savedState.settingMode ?? 'Cameo');
  const charNamesList = ["NAM", "NGỌC", "THƯ"];
  const [theme, setTheme] = useState<string>(savedState.theme ?? 'Wuxia');
  const [customAction, setCustomAction] = useState<string>(savedState.customAction ?? '');
  const [duration, setDuration] = useState<number>(savedState.duration ?? 12);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPrompts, setGeneratedPrompts] = useState<{ id: number, index: number, vi: string, en: string, zh: string }[] | null>(savedState.generatedPrompts ?? null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isCommerceMode, setIsCommerceMode] = useState<boolean>(savedState.isCommerceMode ?? false);
  const [productName, setProductName] = useState<string>(savedState.productName ?? '');
  const [cameraStyle, setCameraStyle] = useState<string>(savedState.cameraStyle ?? 'Handheld');
  const [combatStyle, setCombatStyle] = useState<string>(savedState.combatStyle ?? 'HandToHand');

  useEffect(() => {
    const stateObj = { numCharacters, outfitMode, settingMode, theme, customAction, duration, isCommerceMode, productName, cameraStyle, combatStyle, generatedPrompts };
    localStorage.setItem('actionAppState', JSON.stringify(stateObj));
  }, [numCharacters, outfitMode, settingMode, theme, customAction, duration, isCommerceMode, productName, cameraStyle, combatStyle, generatedPrompts]);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    setGeneratedPrompts(null);
  };

  // API Key State
  const [apiKeys, setApiKeys] = useState<string[]>([]);
  const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(true);
  const [tempApiKeysInput, setTempApiKeysInput] = useState<string>('');
  const [activeApiKeyIndex, setActiveApiKeyIndex] = useState<number>(0);

  useEffect(() => {
    const storedKeys = localStorage.getItem('geminiApiKeys');
    if (storedKeys) {
      try {
        const parsed = JSON.parse(storedKeys);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setApiKeys(parsed);
          setTempApiKeysInput(parsed.join('\n'));
          setShowApiKeyModal(false);
        }
      } catch (e) {
        console.error("Lỗi parse API Keys:", e);
      }
    }
  }, []);

  const handleSaveApiKeys = () => {
    const keys = tempApiKeysInput.split('\n').map(k => k.trim()).filter(k => k.length > 0);
    if (keys.length > 0) {
      setApiKeys(keys);
      localStorage.setItem('geminiApiKeys', JSON.stringify(keys));
      setShowApiKeyModal(false);
      setActiveApiKeyIndex(0);
    } else {
      alert("Vui lòng nhập ít nhất 1 API key.");
    }
  };

  const themes = [
    { 
      id: 'Wuxia', name: 'Kiếm hiệp / Cổ trang', icon: '🗡️', desc: 'Võ thuật truyền thống, hiệp khách, khinh công.',
      outfit: { vi: 'Trang phục cổ trang, áo choàng dài tung bay trong gió, hoa văn thêu chìm tinh xảo.', en: 'Traditional ancient wuxia clothing, long flowing robes fluttering in the wind, intricate hidden embroidery.', zh: '传统古装武侠服饰，随风飘扬的流线型长袍，精致的隐形刺绣。' },
      setting: { vi: 'Rừng trúc hoang vắng mù sương hoặc đỉnh núi tuyết phủ, không khí tĩnh lặng sát khí.', en: 'Desolate misty bamboo forest or snow-capped mountain peak, quiet atmosphere with killing intent.', zh: '荒凉的雾竹林或白雪皑皑的山峰，充满杀气的安静气氛。' }
    },
    { 
      id: 'TimeTravel', name: 'Xuyên không', icon: '⏳', desc: 'Hành động kết hợp yếu tố thời gian/không gian.',
      outfit: { vi: 'Trang phục kết hợp hài hòa giữa giáp chiến binh cổ đại và áo khoác vải công nghệ cao hiện đại.', en: 'Clothing harmoniously blending ancient warrior armor with a high-tech modern fabric jacket.', zh: '融合了古代武士盔甲和高科技现代面料夹克的服装。' },
      setting: { vi: 'Cổng không gian đang mở ra giữa một khu tàn tích cổ đại, ánh sáng không gian xoắn ốc.', en: 'A dimensional portal opening in the middle of ancient ruins, spiraling spatial light.', zh: '在古老废墟中打开的空间传送门，螺旋形的空间光芒。' }
    },
    { 
      id: 'Prison', name: 'Trong tù (Karma)', icon: '⛓️', desc: 'Hành động kịch tính trong môi trường giam giữ.',
      outfit: { vi: 'Quần áo tù nhân màu cam xé rách một phần hoặc áo thun bẩn đầy vệt mồ hôi.', en: 'Partially torn orange prison uniform or dirty t-shirt covered in sweat stains.', zh: '部分撕破的橙色囚服或沾满汗渍的脏T恤。' },
      setting: { vi: 'Khu xà lim ngục tối tăm, hành lang xám xịt với ánh sáng nhấp nháy từ bóng đèn hỏng.', en: 'Dark prison cell block, gloomy corridor with flickering light from a broken bulb.', zh: '黑暗的牢房区，阴暗的走廊，闪烁着坏灯泡的光芒。' }
    },
    { 
      id: 'Revenge', name: 'Báo thù (Justice)', icon: '🔥', desc: 'Cốt truyện tập trung vào sự trả thù, đen tối.',
      outfit: { vi: 'Bộ vest đen rách rưới hoặc áo da sẫm màu với vết thương được băng bó sơ sài.', en: 'Tattered black suit or dark leather jacket with poorly bandaged wounds.', zh: '破烂的黑色西装或深色皮夹克，伤口被草草包扎。' },
      setting: { vi: 'Kho xưởng bỏ hoang dưới trời mưa tầm tã, vũng nước phản chiếu bóng tối u ám.', en: 'Abandoned warehouse under heavy rain, puddles reflecting gloomy darkness.', zh: '倾盆大雨下的废弃仓库，水坑反射着阴郁的黑暗。' }
    },
    { 
      id: 'Rescue', name: 'Giải cứu / Sinh tồn', icon: '🚁', desc: 'Chạy trốn hoặc cứu hộ trong tình huống nguy cấp.',
      outfit: { vi: 'Trang phục dã chiến thực dụng, balo sinh tồn nhỏ, găng tay hở ngón và bốt leo núi.', en: 'Practical field gear, small survival backpack, fingerless gloves, and hiking boots.', zh: '实用的野外装备，小型生存背包，半指手套和登山靴。' },
      setting: { vi: 'Rừng rậm nguyên sinh nguy hiểm hoặc toà nhà đổ nát đang chìm trong biển lửa.', en: 'Dangerous primeval jungle or a ruined building engulfed in flames.', zh: '危险的原始丛林或陷入火海的废墟建筑。' }
    },
    { 
      id: 'Spy', name: 'Gián điệp', icon: '🕵️', desc: 'Hoạt động bí mật, đột nhập, công nghệ cao.',
      outfit: { vi: 'Bộ đồ chiến thuật bó sát màu đen, thiết bị nhìn xuyên màn đêm, tai nghe tình báo cực nhỏ.', en: 'Tight black tactical suit, night vision gear, micro intelligence earpiece.', zh: '黑色紧身战术服，夜视装备，微型情报耳机。' },
      setting: { vi: 'Hành lang bảo mật với các luồng tia laser cảnh báo đỏ rực, cơ sở nghiên cứu tuyệt mật.', en: 'Security corridor with glowing red laser grids, top-secret research facility.', zh: '带有发光红色激光网的安全走廊，绝密研究设施。' }
    },
    { 
      id: 'Cyberpunk', name: 'Viễn tưởng / Cyberpunk', icon: '🤖', desc: 'Công nghệ cao, tương lai đen tối, neon rực rỡ.',
      outfit: { vi: 'Áo khoác có cổ phản quang, chi tiết dây điện, tay máy móc kim loại lộ ra ngoài.', en: 'Jacket with reflective collar, wiring details, exposed metallic cybernetic arm.', zh: '带有反光衣领、接线细节和外露金属控制臂的夹克。' },
      setting: { vi: 'Khu phố chật hẹp dưới cơn mưa axit, ánh đèn neon sặc sỡ nhấp nháy từ các biển hiệu dạ quang.', en: 'Narrow streets under acid rain, vibrant neon lights flickering from holographic signs.', zh: '酸雨下的狭窄街道，全息招牌上闪烁着充满活力的霓虹灯。' }
    },
    { 
      id: 'AssassinCouple', name: 'Vợ chồng sát thủ', icon: '💍', desc: 'Hành động hài hước hoặc kịch tính gia đình.',
      outfit: { vi: 'Trang phục dự tiệc sang trọng (váy dạ hội/suit) nhưng có nếp nhăn và xẻ tà tiện chiến đấu.', en: 'Luxurious evening wear (gown/suit) but with wrinkles and slits convenient for combat.', zh: '豪华的晚礼服（礼服/西装），但有适合战斗的皱褶和开衩。' },
      setting: { vi: 'Bữa tiệc tối sang trọng lộn xộn, bàn ăn vỡ nát, ly rượu vang đổ tràn trên sàn nhà.', en: 'Messy elegant dinner party, smashed dining table, spilled wine glasses on the floor.', zh: '凌乱优雅的晚宴，砸碎的餐桌，洒在地板上的酒杯。' }
    },
    { 
      id: 'MartialArts', name: 'Võ thuật', icon: '🥋', desc: 'Đối kháng tay đôi, các môn phái, võ đài.',
      outfit: { vi: 'Võ phục truyền thống quấn đai, băng tay võ sĩ hoặc áo thun sát nách khỏe khoắn.', en: 'Traditional martial arts uniform with belt, fighter wrist wraps, or a sporty tank top.', zh: '系腰带的传统武术服、拳击腕带或运动背心。' },
      setting: { vi: 'Võ đường sàn gỗ truyền thống, võ đài rực sáng ánh đèn chói lóa từ sảnh thi đấu.', en: 'Traditional wooden dojo floor, fighting ring brilliantly lit by spotlights.', zh: '传统的木制道场区，比武擂台被聚光灯照得灯火通明。' }
    },
    { 
      id: 'Zombie', name: 'Đại dịch Zombie', icon: '🧟', desc: 'Chiến đấu với xác sống và thế giới đổ nát.',
      outfit: { vi: 'Quần áo vá víu nhuốm máu khô và bùn, trang bị tự chế từ băng dính và kim loại cũ.', en: 'Patched clothing stained with dried blood and mud, makeshift gear from duct tape and scrap metal.', zh: '沾满干血和泥土的打成补丁的衣服，由胶带和废金属制成的自制装备。' },
      setting: { vi: 'Đường phố hoang tàn đầy xác xe cộ, sương mù xám xịt, hàng rào thép gai nhuốm máu.', en: 'Desolate streets filled with car wrecks, grey fog, blood-stained barbed wire fences.', zh: '荒凉的街道上到处都是汽车残骸，灰色的雾气，沾满血迹的铁丝网。' }
    },
    { 
      id: 'Superhero', name: 'Siêu anh hùng', icon: '⚡', desc: 'Năng lượng đặc biệt, chiến đấu vì chính nghĩa.',
      outfit: { vi: 'Trang phục siêu anh hùng bó sát với biểu tượng nổi bật trước ngực, áo choàng siêu bền.', en: 'Tight superhero suit with a striking emblem on the chest, ultra-durable cape.', zh: '紧身超级英雄套装，胸前带有醒目徽章，超级耐用的斗篷。' },
      setting: { vi: 'Sân thượng tòa nhà chọc trời nhìn xuống thành phố ban đêm, tia sét rạch ngang bầu trời.', en: 'Skyscraper rooftop overlooking the city at night, lightning bolts striking across the sky.', zh: '摩天大楼的屋顶俯瞰着夜晚的城市，雷电划过天空。' }
    },
    { 
      id: 'Mafia', name: 'Băng đảng Mafia / Cướp', icon: '💰', desc: 'Xã hội đen, đấu súng ngầm, rượt đuổi.',
      outfit: { vi: 'Bộ suit kẻ sọc cổ điển, cà vạt nới lỏng, găng tay da đen, phong cách bợm bãi.', en: 'Classic pinstripe suit, loosened tie, black leather gloves, gritty mobster look.', zh: '经典细条纹西装，宽松领带，黑色皮手套，坚韧的黑帮造型。' },
      setting: { vi: 'Nơi kho tiền ngân hàng bị phá hủy, khói bốc lên từ vụ nổ két sắt, tiền bay lả tả.', en: 'Destroyed bank vault area, smoke rising from blown safe, cash floating in the air.', zh: '被摧毁的银行保险库区域，炸毁的保险箱冒出浓烟，现金在空中飘荡。' }
    },
    { 
      id: 'War', name: 'Chiến tranh / Bắn tỉa', icon: '🪖', desc: 'Quân đội, chiến trường hoành tráng, bắn tỉa.',
      outfit: { vi: 'Quần phục nguỵ trang, áo khoác chống đạn, mũ cối dính đất cát, balo dã chiến lớn.', en: 'Camouflage uniform, bulletproof vest, dirt-covered combat helmet, large field backpack.', zh: '迷彩服、防弹背心、沾满泥土的战斗头盔、大型野战背包。' },
      setting: { vi: 'Chiến trường nhiều khói lửa, chiến hào bùn lầy sâu, vỏ đạn rơi vương vãi trên đất.', en: 'Battlefield filled with smoke and fire, deep muddy trenches, scattered bullet casings.', zh: '战场上硝烟弥漫，深泥泞的战壕里，散落的弹壳散落在地上。' }
    },
    { 
      id: 'Underground', name: 'Đấu trường ngầm', icon: '🥊', desc: 'Không luật lệ, đẫm máu, sinh tử.',
      outfit: { vi: 'Chỉ mặc quần đấm bốc hoặc quần quấn băng, cơ bắp cuồn cuộn đổ mồ hôi, băng quấn tay trần.', en: 'Wearing only boxing shorts or wrapped pants, bulging sweaty muscles, bare hand wraps.', zh: '只穿平角裤或紧身裤，肌肉爆棚，流着汗，裹着双手。' },
      setting: { vi: 'Tầng hầm ẩm thấp với đám đông điên cuồng xung quanh lồng sắt bẩn thỉu rọi đèn.', en: 'Damp basement with a frantic crowd surrounding a dirty wire cage illuminated by spotlights.', zh: '潮湿的地下室里，疯狂的人群围着脏兮兮的铁笼子，聚光灯照亮了这里。' }
    },
    { 
      id: 'Monster', name: 'Săn quái vật', icon: '🐲', desc: 'Chiến đấu với quái thú khổng lồ ác liệt.',
      outfit: { vi: 'Giáp dã thú sần sùi với các mảnh vảy gai góc, vũ khí to bản cồng kềnh đầy tính sát thương.', en: 'Rugged beast armor with spiky scales, oversized and highly damaging bulky weapons.', zh: '长满尖刺鳞片的坚固野兽盔甲，体积庞大且具有高破坏性的大型武器。' },
      setting: { vi: 'Hang động khổng lồ, thạch nhũ phát sáng mờ ảo hoang mang, vệt móng vuốt cào trên đá tảng.', en: 'Giant cavern, faintly glowing mysterious stalactites, deep claw marks on large boulders.', zh: '巨大的洞穴里，发出微弱光晕的神秘钟乳石，巨大的圆形巨石上刻有深深的爪痕。' }
    },
    { 
      id: 'Bodyguard', name: 'Vệ sĩ', icon: '🕶️', desc: 'Bảo vệ mục tiêu VIP khỏi các đợt tấn công.',
      outfit: { vi: 'Suit đen phẳng phiu chuẩn sát thủ lạnh lùng, kính râm đen che nửa khuôn mặt, tai nghe đàm thoại.', en: 'Crisp black suit full of cold assassin vibe, black sunglasses covering half face, earpiece.', zh: '剪裁考究的黑西装，清冷杀手气息满屏，半张脸被黑色墨镜遮住，戴着耳机。' },
      setting: { vi: 'Sảnh khách sạn 5 sao kính vỡ vụn, mảnh đạn găm trên cột đá cẩm thạch trắng sang trọng.', en: '5-star hotel lobby with shattered glass, bullet fragments embedded in white marble columns.', zh: '五星级大堂内玻璃碎裂，子弹碎片嵌在白色大理石柱子上。' }
    },
    { 
      id: 'SpeedChase', name: 'Rượt đuổi tốc độ', icon: '🏎️', desc: 'Đua xe, hành động cường độ cao đường phố.',
      outfit: { vi: 'Áo khoác da đua môtô màu neon bắt mắt, găng tay lái xe chuyên nghiệp và mũ bảo hiểm cầm tay.', en: 'Eye-catching neon motorcycle leather jacket, professional driving gloves, holding a helmet.', zh: '抢眼的霓虹摩托机车皮衣，专业驾驶手套，手拎头盔。' },
      setting: { vi: 'Xa lộ thành phố chật cứng xe cộ về đêm với vệt đèn xe mờ nhòe (motion blur), tia lửa cọ xát.', en: 'Crowded city highway at night with light trails (motion blur) and friction sparks.', zh: '夜晚拥挤的城市高速公路，带有发光轨迹（运动模糊）和摩擦火花。' }
    },
    { 
      id: 'Samurai', name: 'Samurai / Ronin', icon: '⚔️', desc: 'Kiếm sĩ Nhật Bản, đọ kiếm căng thẳng.',
      outfit: { vi: 'Áo kimono xẻ tà bị rách nát, áo giáp vai Samurai, thanh Katana nhuốm máu lạnh lẽo.', en: 'Torn slit kimono, Samurai shoulder armor, a cold and blood-stained Katana blade.', zh: '破裂的开衩和服，武士肩甲，一把冰冷且染血的武士刀。' },
      setting: { vi: 'Ngôi đền cổ dưới tán hoa anh đào tung bay, mặt trăng đỏ rực trên bầu trời đêm u uất.', en: 'Ancient temple beneath fluttering cherry blossoms, bright crimson moon in the somber night sky.', zh: '樱花飘落下的古寺，阴郁夜空中的鲜红月亮。' }
    },
    { 
      id: 'Western', name: 'Cao bồi viễn tây', icon: '🤠', desc: 'Đấu súng miền tây nắng gió, sa mạc.',
      outfit: { vi: 'Mũ rộng vành cổ điển, áo choàng chống bụi, thắt lưng bọc da dắt đầy đạn súng lục.', en: 'Classic wide-brimmed hat, dust coat, leather belt fully loaded with revolver bullets.', zh: '经典宽檐帽、防尘风衣、装满左轮手枪子弹的皮带。' },
      setting: { vi: 'Thị trấn sa mạc đầy cát bụi bay, nắng chói rát, một quán rượu bằng gỗ cũ kỹ.', en: 'Dusty desert town filled with flying sand, scorching sun, an old wooden saloon.', zh: '尘土飞扬的沙漠小镇，烈日炎炎，一家古老的木制酒馆。' }
    },
    { 
      id: 'ActionComedy', name: 'Hành động Hài', icon: '😂', desc: 'Những pha hành động lố bịch, hài hước.',
      outfit: { vi: 'Trang phục đời thường nhưng mặc xộc xệch, như áo hoa sơ mi rực rỡ dơ bẩn hoặc tạp dề đầu bếp.', en: 'Casual but disheveled wear, like a dirty bright floral shirt or a chef apron.', zh: '休闲但显得衣衫不整，比如一件色彩艳丽的脏花衬衫或厨师的围裙。' },
      setting: { vi: 'Khu chợ đầy rau củ trái cây, đồ đạc bay tứ tung nát tươm gây cảm giác hỗn loạn hài hước.', en: 'Marketplace filled with fruits and veggies, items flying around crushed, chaotic and funny.', zh: '市场里摆满了水果蔬菜，被砸碎的东西四处乱飞，混乱而滑稽。' }
    },
    { 
      id: 'Heist', name: 'Trộm cắp nghệ thuật', icon: '💎', desc: 'Trộm đồ bảo mật cao, kỹ năng điêu luyện.',
      outfit: { vi: 'Trang phục đen bó sát, thắt lưng chứa vô số công cụ bẻ khóa và thiết bị công nghệ siêu nhỏ.', en: 'Tight black suit, utility belt with countless lock-picking tools and micro tech gadgets.', zh: '紧身黑色套装、配有无数开锁工具和微型技术小工具的实用腰带。' },
      setting: { vi: 'Bảo tàng sang trọng với hàng rào hồng ngoại laser, một viên kim cương phát sáng lơ lửng.', en: 'Luxurious museum with laser infrared grids, a glowing floating diamond.', zh: '配备激光红外线网格的豪华博物馆，一颗发光的悬浮钻石。' }
    },
    { 
      id: 'GunFu', name: 'Sát thủ Gun-fu', icon: '🔫', desc: 'Phong cách John Wick, Gun-fu đỉnh cao.',
      outfit: { vi: 'Suit ba mảnh may đo hoàn hảo bằng vải Kevlar, thắt cà vạt gọn, không hề lấm lem bụi bẩn.', en: 'Perfectly tailored three-piece Kevlar suit, tight tie, completely immaculately clean.', zh: '完美量身定制的凯夫拉三件套西装，系紧领带，一尘不染。' },
      setting: { vi: 'Hộp đêm sang trọng với ánh đèn neon chớp nhoáng xanh đỏ, sàn nhà kính vỡ nát đầy vỏ đạn.', en: 'Luxurious nightclub with intense red and blue neon flashes, glass floor covered in bullet shells.', zh: '豪华夜总会里红蓝相间的强烈霓虹灯闪烁，玻璃地板上布满了弹壳。' }
    },
    { 
      id: 'Disaster', name: 'Thảm họa thiên nhiên', icon: '🌪️', desc: 'Sinh tồn giữa thảm họa cường độ mạnh.',
      outfit: { vi: 'Trang phục tơi tả phủ đầy tro núi lửa/bùn lầy, trang bị mặt nạ phòng độc hoặc kính bảo hộ.', en: 'Tattered clothes covered in volcanic ash/mud, equipped with a gas mask or protective goggles.', zh: '破烂不堪的衣服上沾满了火山灰/泥浆，戴着防毒面具或护目镜。' },
      setting: { vi: 'Thành phố lớn bị cuồng phong kéo qua, tòa nhà sụp đổ, bầu trời một màu xám đe dọa.', en: 'Metropolis swept by hurricane, crumbling buildings, a threateningly grey sky.', zh: '被飓风席卷的大都市、摇摇欲坠的建筑物、灰蒙蒙的充满威胁的天空。' }
    },
    { 
      id: 'ExtremeSports', name: 'Thể thao mạo hiểm', icon: '🏂', desc: 'Pha nguy hiểm trên không, ván trượt.',
      outfit: { vi: 'Đồ thể thao chuyên dụng màu sắc phản quang mạnh, nón bảo hiểm full-face hầm hố.', en: 'Specialized extreme sportswear with strong reflective colors, aggressive full-face helmet.', zh: '专业极限运动服，颜色强烈反光，防护感十足的全盔。' },
      setting: { vi: 'Vách đá dốc ngược độ cao chóng mặt hoặc sân tuyết mịt mù cheo leo giữa trời mây.', en: 'Dizzying vertical cliff side or a perilous snowy terrain dangling amidst clouds.', zh: '令人眼晕的垂直悬崖峭壁或云层中危险的雪地。' }
    },
    { 
      id: 'SpaceSciFi', name: 'Viễn tưởng vũ trụ', icon: '🚀', desc: 'Hành động không trọng lực, tàu vũ trụ.',
      outfit: { vi: 'Bộ đồ phi hành gia vũ trang hầm hố công nghệ cao, nạm kính phản quang và súng năng lượng.', en: 'Heavy armed high-tech astronaut suit with reflective visor and energy blaster.', zh: '装备精良的高科技宇航员服，配有反光面罩和能量发射器。' },
      setting: { vi: 'Hành lang tàu vũ trụ rạn nứt bị cảnh báo đỏ, không gian không trọng lực với mảnh vỡ lơ lửng.', en: 'Cracked spaceship corridor with red alerts, zero gravity space with floating debris.', zh: '飞船走廊破裂拉响红色警报，失重太空中漂浮着碎片。' }
    },
    { 
      id: 'Custom', name: 'Kịch bản tùy chọn', icon: '✍️', desc: 'Ngữ cảnh hành động tùy chọn.',
      outfit: { vi: 'Trang phục hành động chiến đấu đặc chế phù hợp với hoàn cảnh tùy chọn.', en: 'Specially tailored action combat outfit fitted to the custom scenario.', zh: '根据自定义场景特别量身定制的动作战斗服。' },
      setting: { vi: 'Bối cảnh điện ảnh mãn nhãn cực kỳ sống động dựa theo nội dung tùy chỉnh.', en: 'Stunning highly vivid cinematic setup based on the custom content.', zh: '根据自定义内容精心打造极为生动的电影级场景。' }
    }
  ];

  const cameraStyles = [
    { id: 'Medium', name: 'Medium Shot', icon: '🎥', descriptions: { vi: 'Máy quay cận trung, lấy rõ hành động vung đòn và biểu cảm.', en: 'Medium shot, capturing clear strikes and expressions.', zh: '中景，清晰捕捉打击和表情。' } },
    { id: 'Handheld', name: 'Handheld/Shaky', icon: '📳', descriptions: { vi: 'Máy quay cầm tay rung lắc, tạo cảm giác hỗn loạn kịch tính.', en: 'Shaky handheld camera, creating a chaotic and dramatic feel.', zh: '手持摇晃镜头，营造混乱和戏剧性的感觉。' } },
    { id: 'SlowMo', name: 'Slow Motion', icon: '⏳', descriptions: { vi: 'Quay chậm (Slow motion) tập trung chi tiết đòn đánh sấm sét.', en: 'Slow motion focusing on the details of devastating strikes.', zh: '慢动作专注于毁灭性打击的细节。' } },
    { id: 'Tracking', name: 'Tracking Shot', icon: '🏃', descriptions: { vi: 'Lia máy liên tục bám sát sự di chuyển nhanh của nhân vật.', en: 'Continuous tracking shot following the characters fast movement.', zh: '连续跟踪拍摄，跟随角色的快速移动。' } },
    { id: 'Drone', name: 'Drone/Aerial', icon: '🚁', descriptions: { vi: 'Góc quay từ trên cao bao quát diện rộng, thích hợp rượt đuổi.', en: 'Aerial high-angle shot covering a wide area, suitable for chases.', zh: '覆盖大面积的高空俯冲镜头，适合追逐。' } },
  ];

  const combatStyles = [
    { id: 'HandToHand', name: 'Cận chiến', icon: '🥊', descriptions: { vi: 'Ra đòn tay không võ thuật mượt mà, đấm đá dứt khoát uy lực.', en: 'Smooth hand-to-hand martial arts, decisive and powerful punches/kicks.', zh: '流畅的肉搏武术，果断有力的拳打脚踢。' } },
    { id: 'Weapon', name: 'Dùng Vũ Khí', icon: '⚔️', descriptions: { vi: 'Múa vũ khí điêu luyện, chém/bắn dứt khoát sát thương cao.', en: 'Skillful weapon handling, slashing/shooting with high damage precision.', zh: '熟练的武器处理，以高伤害精度斩击/射击。' } },
    { id: 'Acrobatic', name: 'Bay nhảy/Khinh công', icon: '🤸', descriptions: { vi: 'Nhào lộn trên không, né đòn ngoạn mục, mượn đà môi trường.', en: 'Acrobatic flips in the air, spectacular dodging, utilizing environment.', zh: '空中杂技翻转，壮观的躲闪，利用环境。' } },
    { id: 'Brutal', name: 'Bạo lực/Máu me', icon: '🩸', descriptions: { vi: 'Đánh tàn bạo, sát thương vật lý mạnh, không nhân nhượng.', en: 'Brutal strikes, heavy physical damage, showing no mercy.', zh: '野蛮打击，严重的物理伤害，毫不留情。' } },
    { id: 'Comedic', name: 'Hài hước', icon: '🤪', descriptions: { vi: 'Hành động kết hợp yếu tố may mắn, tấu hài và biểu cảm lố.', en: 'Action mixed with lucky escapes, slapstick comedy, and goofy expressions.', zh: '动作混合了幸运逃脱，闹剧喜剧和愚蠢的表情。' } },
  ];

  const handleDurationChange = (type: 'plus' | 'minus') => {
    if (type === 'plus') setDuration(prev => prev + 12);
    else setDuration(prev => Math.max(12, prev - 12));
  };

  const generatePrompts = async () => {
    if (apiKeys.length === 0) {
      alert("Vui lòng nhập API Key để sử dụng các tính năng AI của hệ thống.");
      setShowApiKeyModal(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedPrompts(null);
    const sessionSeed = Math.floor(Math.random() * 1000000);

    const themeObj = themes.find(t => t.id === theme) || themes[0];
    const numPrompts = Math.floor(duration / 12);
    const charNamesToUse = charNamesList.slice(0, numCharacters);
    let aiResult: any = null;

    try {
      const responseStr = await executeAiWithFallback(apiKeys, activeApiKeyIndex, setActiveApiKeyIndex, async (genAI) => {
        const promptText = `
Tạo một kịch bản phim hành động hoàn toàn độc đáo, ngẫu nhiên và không lặp lại.
Chủ đề: ${themeObj.name} (${theme === 'Custom' && customAction ? customAction : themeObj.desc})
Phong cách chiến đấu: ${combatStyles.find(c => c.id === combatStyle)?.name}
Góc máy: ${cameraStyles.find(c => c.id === cameraStyle)?.name}
Số lượng nhân vật chính: ${numCharacters} (Tên các nhân vật: ${charNamesToUse.join(", ")})
Số lượng đoạn (parts): ${numPrompts} (mỗi đoạn 12s)

Yêu cầu:
1. Bối cảnh (Setting): ${settingMode === 'Cameo' ? 'Giữ nguyên bối cảnh cameo gốc, trả về kết quả RẤT NGẮN GỌN (1 câu)' : 'Sáng tạo một bối cảnh điện ảnh mới lạ, nhưng RẤT NGẮN GỌN (1-2 câu ngắn)'}
2. Trang phục (Outfit): ${outfitMode === 'Cameo' ? 'Giữ nguyên trang phục cameo gốc, trả về RẤT NGẮN GỌN (vài từ)' : 'Sáng tạo một trang phục mới, RẤT NGẮN GỌN (1 câu)'}
3. Hành động (Action): Mô tả chung NGẮN GỌN (1 câu) về diễn biến của toàn bộ cảnh quay hành động.
4. Timelines: CHI TIẾT TỪNG HÀNH ĐỘNG. Mảng chứa đúng ${numPrompts} phần tử, mỗi phần tử là diễn biến chi tiết cho đoạn 12s đó, chia theo các mốc 0-3s, 3-6s, 6-9s, 9-12s. Không lặp lại nội dung giữa các đoạn, phải liên kết thành chuỗi hành động trọn vẹn, đoạn sau nối tiếp đoạn trước. Tiền tố dòng đầu luôn là "Timeline Chi Tiết:". BẮT BUỘC SỬ DỤNG TRỰC TIẾP TÊN CÁC NHÂN VẬT (${charNamesToUse.join(", ")}) TRONG MÔ TẢ TIMELINE thay vì dùng từ chung chung (Ví dụ: "0-3s: NAM lao tới tung cú đấm...").

Trả về kết quả dưới dạng JSON hợp lệ (RAW JSON, không bọc trong markdown \`\`\`json):
{
  "setting": { "vi": "...", "en": "...", "zh": "..." },
  "outfit": { "vi": "...", "en": "...", "zh": "..." },
  "action": { "vi": "...", "en": "...", "zh": "..." },
  "timelines": [
    {
       "vi": "Timeline Chi Tiết:\\n0-3s:...\\n3-6s:...\\n6-9s:...\\n9-12s:...",
       "en": "Detailed Timeline:\\n0-3s:...\\n3-6s:...\\n6-9s:...\\n9-12s:...",
       "zh": "详细时间轴:\\n0-3s:...\\n3-6s:...\\n6-9s:...\\n9-12s:..."
    }
  ]
}
`;
        const response = await genAI.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: promptText,
           config: {
             temperature: 0.9
           }
        });
        return response.text;
      });

      if (responseStr) {
         let cleanedStr = responseStr;
         const match = responseStr.match(/\{[\s\S]*\}/);
         if (match) {
            cleanedStr = match[0];
         }
         aiResult = JSON.parse(cleanedStr);
      }
    } catch (e: any) {
       console.warn("AI Generation failed:", e);
       alert("Lỗi khi kết nối AI để tạo kịch bản mới: " + e.message + "\\nVui lòng thử lại.");
       setIsGenerating(false);
       return;
    }

    if (!aiResult || !aiResult.timelines || aiResult.timelines.length < numPrompts) {
      alert("AI không trả về đủ dữ liệu kịch bản. Vui lòng thử lại.");
      setIsGenerating(false);
      return;
    }

    const promptList: any[] = [];

    for (let i = 0; i < numPrompts; i++) {
        const createPromptForLang = (langKey: "vi" | "en" | "zh") => {
          const actionText = aiResult.action[langKey];
          const settingVal = aiResult.setting[langKey];
          const outfitDesc = aiResult.outfit[langKey];
          const timelineContent = aiResult.timelines[i]?.[langKey] || "";

          const labels = {
            vi: ["Bối cảnh", "Thể loại", "Phong cách", "Nhân vật", "Trang phục", "Góc quay", "Ánh sáng", "Hành động / Phong cách chiến đấu", "Lưu ý", "Quảng cáo Sản phẩm"],
            en: ["Setting", "Genre", "Style", "Characters", "Outfit", "Camera Angle", "Lighting", "Action / Combat Style", "Note", "Product Placement"],
            zh: ["背景", "类型", "风格", "角色", "服装", "相机角度", "灯光", "动作 / 战斗风格", "注意", "产品放置"]
          }[langKey];

          const styleVal = {
            vi: "Cinematic 4K, siêu chân thực, sắc nét đến từng chi tiết băng hạt bụi bay.",
            en: "Cinematic 4K, hyper-realistic, sharp details showing flying dust particles.",
            zh: "电影级 4K，超逼真，清晰的细节显示飞扬的灰尘颗粒。"
          }[langKey];

          const charNamesToUse = charNamesList.slice(0, numCharacters);
          const charStr = charNamesToUse.map(name => `${name} (Action Hero/Villain)`).join(" vs ");
          
          let outfitStr = charNamesToUse.map(name => `${name}: ${outfitDesc}`).join(", ");

          const selectedCameraObj = cameraStyles.find(c => c.id === cameraStyle);
          const cameraVal = selectedCameraObj?.descriptions[langKey];

          const selectedCombatObj = combatStyles.find(c => c.id === combatStyle);
          const combatVal = selectedCombatObj?.descriptions[langKey];

          const lightVal = {
            vi: "Ánh sáng tương phản cao (High-contrast), bóng đổ sắc nét tạo chiều sâu điện ảnh.",
            en: "High-contrast lighting, sharp shadows creating cinematic depth.",
            zh: "高对比度照明，锐利的阴影产生电影深度。"
          }[langKey];

          const noTextNote = {
            vi: "KHÔNG chèn thêm bất kỳ văn bản, chữ, logo lạ nào vào hình ảnh.",
            en: "DO NOT add any text, typography, or random logos onto the image.",
            zh: "请勿在图片中添加任何文字、排版或随机徽标。"
          }[langKey];

          let finalPrompt = `${labels[0]}: ${settingVal}\n${labels[1]}: ${actionText}\n${labels[2]}: ${styleVal}\n${labels[3]}: ${charStr}\n${labels[4]}: \n${outfitStr}\n${labels[5]}: ${cameraVal}\n${labels[6]}: ${lightVal}\n${labels[7]}: ${combatVal}`;

          if (isCommerceMode && productName) {
            const productDesc = {
              vi: `Sản phẩm "${productName}" được tích hợp tự nhiên vào bối cảnh chiến đấu (có thể bị văng, cầm trên tay, rơi trên nền), giữ ĐÚNG kiểu mẫu và màu sắc gốc tuyệt đối.`,
              en: `Product "${productName}" naturally integrated into the combat scene (held, thrown, or dropped), keeping the EXACT original styling and colors perfectly.`,
              zh: `产品 "${productName}" 自然地融入战斗场景，保持完全一致的原始原始颜色。`
            }[langKey];
            finalPrompt += `\n${labels[9]}: ${productDesc}`;
          }

          finalPrompt += `\n\n${timelineContent}\n\n${labels[8]}: ${noTextNote}`;

          return finalPrompt;
        };

        promptList.push({
          id: sessionSeed + i,
          index: i + 1,
          vi: createPromptForLang('vi'),
          en: createPromptForLang('en'),
          zh: createPromptForLang('zh')
        });
      }

      setGeneratedPrompts(promptList);
      setIsGenerating(false);
  };

  const copyToClipboard = (text: string, key: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const downloadAllPrompts = () => {
    if (!generatedPrompts) return;
    
    let content = "=== DANH SÁCH KỊCH BẢN HÀNH ĐỘNG ===\n\n";
    generatedPrompts.forEach((prompt, index) => {
      content += `PART ${prompt.index}:\n`;
      content += `--- TIẾNG VIỆT ---\n${prompt.vi}\n\n`;
      content += `--- ENGLISH ---\n${prompt.en}\n\n`;
      content += `--- CHINESE ---\n${prompt.zh}\n\n`;
      content += "=".repeat(40) + "\n\n";
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kich_ban_action_movie_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-4 font-sans flex flex-col items-center">
      {/* API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center gap-3 mb-4 text-orange-500">
              <Key size={24} />
              <h2 className="text-xl font-black uppercase">Cấu hình API Key (AI)</h2>
            </div>
            <p className="text-sm text-neutral-400 mb-4 leading-relaxed">
              Vui lòng nhập danh sách API Key của Google Gemini để sử dụng tính năng tạo và dịch tự động. 
            </p>
            <textarea
              value={tempApiKeysInput}
              onChange={(e) => setTempApiKeysInput(e.target.value)}
              placeholder={`AIzaSy...\nAIzaSy...`}
              className="w-full h-32 bg-black border border-neutral-800 rounded-xl p-4 text-xs font-mono text-neutral-300 mb-4 focus:outline-none focus:border-orange-600 transition-colors"
            ></textarea>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleSaveApiKeys}
                className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-bold text-white hover:opacity-90 active:scale-95 transition-all"
              >
                Lưu Danh Sách API Key
              </button>
              {apiKeys.length > 0 && (
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="w-full py-2 bg-neutral-800 rounded-xl font-semibold text-neutral-400 hover:text-white transition-colors"
                >
                  Đóng
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="w-full flex justify-end max-w-2xl">
        <button 
          onClick={() => setShowApiKeyModal(true)}
          className="text-xs font-bold text-neutral-500 hover:text-orange-400 flex items-center gap-1 transition-colors"
        >
          <Key size={12} /> Cấu hình API ({apiKeys.length} keys)
        </button>
      </div>

      <div className="w-full max-w-2xl mb-8 mt-4 text-center">
        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500 bg-clip-text text-transparent flex items-center justify-center gap-2 uppercase">
          <Sword className="text-red-500" /> Action Movie Pro
        </h1>
        <p className="text-neutral-400 mt-2 text-sm font-medium italic">"Đạo diễn võ thuật & hành động điện ảnh bằng AI"</p>
      </div>

      <div className="w-full max-w-2xl space-y-4">
        {/* Core Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-orange-400 text-[10px] font-black uppercase">
              <Users size={12} /> Phe phái
            </div>
            <div className="flex gap-1">
              {[1, 2, 3].map(num => (
                <button key={num} onClick={() => setNumCharacters(num)} className={`flex-1 py-2 rounded-lg font-bold text-xs transition-all ${numCharacters === num ? 'bg-orange-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-500'}`}>
                  {num} Người
                </button>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-purple-400 text-[10px] font-black uppercase">
              <Shirt size={12} /> Trang phục (Giáp/Đồ)
            </div>
            <div className="flex gap-1">
              <button onClick={() => setOutfitMode('Cameo')} className={`flex-1 py-1 px-1 rounded-lg font-bold text-[10px] transition-all ${outfitMode === 'Cameo' ? 'bg-purple-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-500'}`}>Cameo</button>
              <button onClick={() => setOutfitMode('AI')} className={`flex-1 py-1 px-1 rounded-lg font-bold text-[10px] transition-all ${outfitMode === 'AI' ? 'bg-purple-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-500'}`}>AI Theme</button>
            </div>
          </div>

          <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 text-[10px] font-black uppercase">
              <MonitorPlay size={12} /> Chiến trường
            </div>
            <div className="flex gap-1">
              <button onClick={() => setSettingMode('Cameo')} className={`flex-1 py-1 px-1 rounded-lg font-bold text-[10px] transition-all ${settingMode === 'Cameo' ? 'bg-emerald-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-500'}`}>Cameo</button>
              <button onClick={() => setSettingMode('Theme')} className={`flex-1 py-1 px-1 rounded-lg font-bold text-[10px] transition-all ${settingMode === 'Theme' ? 'bg-emerald-600 text-white shadow-md' : 'bg-neutral-800 text-neutral-500'}`}>Tùy chọn</button>
            </div>
          </div>
        </div>

        {/* Extended Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-red-500 text-[10px] font-black uppercase">
              <Star size={12} /> Thể loại Phim
            </div>
            <select value={theme} onChange={(e) => handleThemeChange(e.target.value)} className="w-full bg-neutral-800 text-white p-2 rounded-lg border-none text-xs font-bold h-[34px] focus:ring-0 mb-3 outline-none">
              {themes.map(t => (
                <option key={t.id} value={t.id}>{t.icon} {t.name}</option>
              ))}
            </select>
            {theme === 'Custom' && (
              <div className="animate-in fade-in zoom-in duration-300">
                <input
                  type="text"
                  placeholder="Mô tả bối cảnh hành động (VD: Đánh nhau trên mui tàu hoả)"
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-red-600 transition-all text-xs font-medium outline-none"
                />
              </div>
            )}
          </div>

          <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 shadow-lg">
            <div className="flex items-center gap-2 mb-3 text-yellow-400 text-[10px] font-black uppercase">
              <Flame size={12} /> Phong cách Chiến Đấu
            </div>
            <select value={combatStyle} onChange={(e) => setCombatStyle(e.target.value)} className="w-full bg-neutral-800 text-white p-2 rounded-lg border-none text-xs font-bold h-[34px] focus:ring-0 outline-none mb-3">
              {combatStyles.map(c => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>

            <div className="flex items-center gap-2 mt-4 mb-2 text-cyan-400 text-[10px] font-black uppercase">
              <Camera size={12} /> Kỹ thuật quay/Góc máy
            </div>
            <select value={cameraStyle} onChange={(e) => setCameraStyle(e.target.value)} className="w-full bg-neutral-800 text-white p-2 rounded-lg border-none text-xs font-bold h-[34px] focus:ring-0 outline-none">
              {cameraStyles.map(es => (
                <option key={es.id} value={es.id}>{es.icon} {es.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer controls */}
        <div className="bg-neutral-900/50 p-4 rounded-2xl border border-neutral-800 shadow-lg col-span-1 md:col-span-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
           <div className="flex items-center justify-between gap-4 flex-1">
             <div className="flex items-center gap-2 text-blue-400 text-[10px] font-black uppercase font-mono">
                <Clock size={12} /> Độ dài kịch bản (12s/part)
             </div>
             <div className="flex items-center justify-between bg-neutral-800 rounded-lg p-1 min-w-[100px]">
                <button onClick={() => handleDurationChange('minus')} className="p-2 hover:text-white transition-colors" disabled={duration <= 12}><ChevronDown size={14}/></button>
                <span className="font-black text-sm">{duration}s</span>
                <button onClick={() => handleDurationChange('plus')} className="p-2 hover:text-white transition-colors"><ChevronUp size={14}/></button>
             </div>
           </div>
           <div className="w-[1px] h-8 bg-neutral-800 hidden md:block"></div>
           <div className="flex items-center justify-between gap-4 flex-1">
             <div className="flex items-center gap-2 text-pink-400 text-[10px] font-black uppercase font-mono">
               <ShoppingBag size={12} /> Quảng Cáo Tài Trợ (Tham Chiếu)
             </div>
             <button
               onClick={() => setIsCommerceMode(!isCommerceMode)}
               className={`relative inline-flex h-5 w-10 items-center rounded-full transition-colors ${
                 isCommerceMode ? 'bg-pink-600' : 'bg-neutral-700'
               }`}
             >
               <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${isCommerceMode ? 'translate-x-6' : 'translate-x-1'}`} />
             </button>
           </div>
        </div>

        {isCommerceMode && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300 mt-4 bg-neutral-900/50 p-4 rounded-2xl border border-pink-900/50 shadow-lg">
            <input
              type="text"
              placeholder="Nhập vật phẩm thương hiệu mong muốn xuất hiện (VD: Lon Bò Húc, Chai nước lọc, Giày hiệu...)"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-pink-500 transition-all text-sm outline-none"
            />
            <p className="text-[10px] text-pink-500/70 mt-2 italic font-medium">
              * Khuyến cáo: AI sẽ gắn mã nhúng buộc xuất hiện vật phẩm này trong cảnh quay.
            </p>
          </div>
        )}

        <button
          onClick={generatePrompts}
          disabled={isGenerating || (theme === 'Custom' && !customAction)}
          className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-2xl font-black text-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 mt-4"
        >
          {isGenerating ? <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div> : <><Zap size={22} fill="currentColor" /> XUẤT KỊCH BẢN HÀNH ĐỘNG</>}
        </button>

        {generatedPrompts && (
          <button
            onClick={downloadAllPrompts}
            className="w-full py-3 bg-neutral-800 border border-neutral-700 text-neutral-300 rounded-xl font-bold text-sm hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <Download size={18} /> TẢI XUỐNG TẤT CẢ PROMPT (.TXT)
          </button>
        )}

        {generatedPrompts && (
          <div className="space-y-10 mt-8 pb-20">
            {generatedPrompts.map((prompt, pIdx) => (
              <div key={prompt.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2 px-3 py-1 bg-neutral-900 border border-neutral-800 rounded-full text-[10px] font-black text-neutral-400">
                      {pIdx % 3 === 0 ? 'PART 1: MỞ ĐẦU, THỦ THẾ & PHÁT ĐỘNG TẤN CÔNG' : pIdx % 3 === 1 ? 'PART 2: GIAO TRANH ÁC LIỆT & ĐỈNH ĐIỂM' : 'PART 3: CÚ CHỐT & HẬU QUẢ'}
                   </div>
                   <div className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-red-500/10 px-2 py-1 rounded">
                     Video Part {prompt.index}
                   </div>
                </div>

                <div className="space-y-4">
                  {[
                    { lang: 'vi', label: 'TIẾNG VIỆT', content: prompt.vi, color: 'border-blue-500/20' },
                    { lang: 'en', label: 'ENGLISH', content: prompt.en, color: 'border-emerald-500/20' },
                    { lang: 'zh', label: 'CHINESE', content: prompt.zh, color: 'border-amber-500/20' }
                  ].map((item) => {
                    const uniqueKey = `${prompt.id}-${item.lang}`;
                    return (
                      <div key={item.lang} className={`bg-neutral-900/60 rounded-2xl border ${item.color} overflow-hidden`}>
                        <div className="bg-neutral-800/40 px-4 py-2 flex justify-between items-center border-b border-neutral-800/50">
                          <span className="text-[9px] font-black tracking-tighter text-neutral-400">{item.label}</span>
                          <button 
                            onClick={() => copyToClipboard(item.content, uniqueKey)}
                            className={`flex items-center gap-1 text-[9px] font-bold px-3 py-1.5 rounded-lg transition-all ${
                                copiedKey === uniqueKey ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-700'
                            }`}
                          >
                            {copiedKey === uniqueKey ? <Check size={12} /> : <Copy size={12} />} {copiedKey === uniqueKey ? 'COPIED' : 'COPY PROMPT'}
                          </button>
                        </div>
                        <div className="p-4">
                          <pre className="text-[11.5px] md:text-xs leading-[1.6] text-neutral-300/90 whitespace-pre-wrap font-sans">
                            {item.content}
                          </pre>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pinned Footer */}
      <div className="fixed bottom-0 left-0 right-0 w-full py-3 bg-neutral-950/80 backdrop-blur-md border-t border-neutral-800 text-center z-40 flex items-center justify-center">
        <p className="text-xs font-bold text-neutral-400">
          Hỗ trợ liên hệ Nam <span className="text-orange-500 ml-1">0981028794</span>
        </p>
      </div>
    </div>
  );
};

export default App;
