#!/bin/bash

# 檢查 public/avatars 資料夾檔案是否達到 1000 個，若是則不執行
FILE_COUNT=$(ls -1 "$(dirname "$0")/../public/avatars" | wc -l)
if [ "$FILE_COUNT" -ge 1000 ]; then
  echo "Avatar 圖片數量已達到 $FILE_COUNT 個，跳過本次自動生成。"
  exit 0
fi

# 1. 將所有動物名稱定義在一個 Bash 陣列中
#    注意：有空格的名稱 (如 "Guinea Pig") 需要用引號括起來
animals=(
"Lion" "Tiger" "Bear" "Elephant" "Giraffe" "Zebra" "Kangaroo" "Monkey" "Gorilla"
"Chimpanzee" "Hippopotamus" "Rhinoceros" "Cheetah" "Leopard" "Jaguar" "Wolf"
"Fox" "Deer" "Moose" "Reindeer" "Horse" "Donkey" "Cow" "Bull" "Pig" "Sheep"
"Goat" "Chicken" "Rooster" "Duck" "Goose" "Turkey" "Dog" "Cat" "Rabbit"
"Hamster" "Guinea Pig" "Mouse" "Rat" "Squirrel" "Beaver" "Otter" "Seal"
"Walrus" "Whale" "Dolphin" "Shark" "Octopus" "Squid" "Jellyfish" "Starfish"
"Crab" "Lobster" "Shrimp" "Fish" "Salmon" "Tuna" "Frog" "Toad" "Lizard"
"Snake" "Crocodile" "Alligator" "Turtle" "Tortoise" "Bird" "Eagle" "Hawk"
"Falcon" "Owl" "Parrot" "Penguin" "Ostrich" "Emu" "Flamingo" "Swan"
"Pelican" "Pigeon" "Sparrow" "Crow" "Raven" "Bat" "Spider" "Scorpion"
"Ant" "Bee" "Wasp" "Butterfly" "Moth" "Dragonfly" "Ladybug" "Grasshopper"
"Cricket" "Snail" "Slug" "Worm" "Koala" "Panda" "Sloth" "Hedgehog"
)

# 2. 取得陣列的總長度 (元素個數)
num_animals=${#animals[@]}

# 3. 產生一個隨機索引 ( $RANDOM 是內建變數，範圍 0-32767 )
#    ( $RANDOM % $num_animals ) 會得到 0 到 (num_animals - 1) 之間的數字
random_index=$(($RANDOM % $num_animals))

# 4. 根據隨機索引，從陣列中選出動物
selected_animal=${animals[$random_index]}

# 5. 組合並印出最終的提示詞
positive_prompt="a photo of an anthropomorphic $selected_animal wearing a spacesuit inside a sci-fi spaceship, cinematic, dramatic lighting, high resolution, detailed, 4k"
negative_prompt="blurry, illustration, toy, clay, low quality, flag, nasa, mission patch"

# 6. 執行 generate.sh 腳本，並傳入提示詞
./generate.sh "$positive_prompt" "$negative_prompt"
