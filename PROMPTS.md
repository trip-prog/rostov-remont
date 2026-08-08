# Промпты для кадров «комната собирается»

## Главное правило

Все 5 кадров должны быть **одним и тем же кадром** одной комнаты: та же камера, тот же ракурс, тот же свет. Поэтому порядок работы строго такой:

1. Сначала генерируем **СТАДИЮ 5** (полностью готовая комната) — это единственная генерация «с нуля».
2. Каждую следующую стадию получаем **редактированием предыдущей картинки** (режим edit / inpaint: загружаете картинку и просите убрать предметы). Никогда не генерируйте стадии заново с нуля — иначе ракурс «поплывёт».
3. Идём от полной комнаты вниз: 5 → 4 → 3 → 2 → 1 (убираем предметы). На сайте кадры проигрываются в обратном порядке, и комната «собирается».

Где делать: Gemini (nano banana) — бесплатно и отлично держит кадр; альтернативы: Photoshop Generative Fill, getimg.ai.

## Требования к файлам

- Формат: JPG (или WebP), горизонталь **16:9**, минимум **1600×900** (лучше 1920×1080).
- Все 5 файлов строго одинакового размера в пикселях.
- Имена: `stage-1.jpg`, `stage-2.jpg`, `stage-3.jpg`, `stage-4.jpg`, `stage-5.jpg` — положить в папку `img/` (там сейчас лежат мои SVG-заглушки).
- Проверка качества: откройте кадры подряд как слайдшоу и быстро пролистайте. Окно, дверь, углы стен не должны «прыгать». Если что-то поплыло — перегенерируйте этот шаг ещё раз.

---

## СТАДИЯ 5 — готовая комната (генерация с нуля)

```
Photorealistic interior photograph of a cozy modern living room, warm cream and
beige tones with brass and gold accents. Wide-angle eye-level shot, camera facing
the main wall straight on. Light beige fabric sofa with decorative textured pillows,
wooden coffee table with a ceramic vase, soft area rug, brass arc floor lamp, large
potted plant in the corner, framed wall art above the sofa, elegant pendant ceiling
lamp, light oak herringbone wooden floor, smooth painted warm-white walls, large
window on the left with sheer curtains, soft warm natural daylight, gentle shadows,
high detail, professional real estate photography, 16:9
```

Если картинка понравилась — сохраняйте, это ваш «эталонный кадр». Все правки ниже делаются на его основе.

## СТАДИЯ 4 — убираем финальные штрихи (edit к стадии 5)

```
Edit this photo. Remove the framed wall art, the decorative pillows from the sofa,
the ceramic vase and all small accessories from the coffee table. Keep absolutely
everything else identical: same camera angle, same lighting, same sofa, table, rug,
floor lamp, plant, pendant lamp, walls, floor and window. Do not move the camera.
```

## СТАДИЯ 3 — убираем свет и растения (edit к стадии 4)

```
Edit this photo. Remove the brass floor lamp, the large potted plant and the pendant
ceiling lamp (leave a bare ceiling). Keep everything else identical: same camera
angle, same lighting, same sofa, coffee table, rug, walls, floor and window.
Do not move the camera.
```

## СТАДИЯ 2 — убираем мебель (edit к стадии 3)

```
Edit this photo. Remove the sofa, the coffee table and the rug completely. The room
becomes an empty renovated room with the same painted warm-white walls, the same
light oak herringbone floor and the same window with sheer curtains. Same camera
angle and lighting. Do not move the camera.
```

## СТАДИЯ 1 — черновая отделка (edit к стадии 2)

```
Edit this photo. Transform this empty renovated room into the same room during
early renovation: bare grey plaster and putty walls with visible patches, raw
concrete screed floor with some dust, no curtains on the window (bare window frame),
a few traces of construction work. Same room geometry, same camera angle, same
window position, same daylight. Do not move the camera.
```

## СТАДИЯ 0 — коробка от застройщика (edit к стадии 1)

Самый первый кадр: газоблочные стены без штукатурки, голый бетонный потолок с проводкой, стяжка с трубами — как выглядит квартира в новостройке при приёмке.

```
Edit this photo. Transform this room into the same room at the very first stage of
renovation, as handed over by the developer in a new building: walls made of bare
white aerated concrete blocks (autoclaved gas blocks) with visible grey mortar
joints between blocks, no plaster at all; raw grey concrete ceiling slab with
exposed black electrical cables in corrugated conduit stapled to the ceiling and
one temporary hanging work bulb; rough dusty concrete screed floor with thin red
and blue plumbing pipes running along the floor near the wall; bare window frame
without curtains; remove the wooden shelving frame, leave a bare concrete niche
instead. Same room geometry, same camera angle, same window position, same
daylight. Do not move the camera.
```

Если блоки получаются слишком аккуратными, добавить в конец: `make it look like a real construction site photo, slightly dusty and imperfect`. Файл: `stage-0.jpg`.

---

## Что потом

Скиньте мне 5 готовых файлов (или просто положите их в `img/` этой папки и напишите мне) — я подключу их вместо заглушек, сожму в WebP, настрою предзагрузку и выложу лабораторную версию. Если какая-то стадия не будет получаться — присылайте, что вышло, подскажу, как поправить промпт.
