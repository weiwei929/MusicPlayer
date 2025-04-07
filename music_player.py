import pygame
import os
import time

def play_music(music_file):
    """
    播放指定的音乐文件
    """
    pygame.mixer.init()
    pygame.mixer.music.load(music_file)
    pygame.mixer.music.play()
    
    # 等待音乐播放完毕
    while pygame.mixer.music.get_busy():
        time.sleep(1)

if __name__ == "__main__":
    pygame.init()
    
    # 音乐文件路径 - 请确保这个文件存在
    music_folder = "music"  # 音乐文件夹
    
    # 如果音乐文件夹不存在，创建它
    if not os.path.exists(music_folder):
        os.makedirs(music_folder)
        print(f"已创建 {music_folder} 文件夹，请在其中放入音乐文件")
    
    # 列出音乐文件夹中的文件
    music_files = [f for f in os.listdir(music_folder) if f.endswith(('.mp3', '.wav', '.ogg'))]
    
    if not music_files:
        print(f"在 {music_folder} 文件夹中没有找到音乐文件")
        print("请添加 .mp3, .wav 或 .ogg 格式的音乐文件到此文件夹")
    else:
        print("可用音乐文件:")
        for i, file in enumerate(music_files):
            print(f"{i+1}. {file}")
        
        # 选择要播放的文件
        selection = int(input("请选择要播放的音乐文件编号: ")) - 1
        if 0 <= selection < len(music_files):
            music_file = os.path.join(music_folder, music_files[selection])
            print(f"正在播放: {music_files[selection]}")
            play_music(music_file)
        else:
            print("无效的选择")
    
    pygame.quit()