import os
import warnings

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3' 

warnings.filterwarnings('ignore')


import speech_recognition as sr
from deepmultilingualpunctuation import PunctuationModel

print("Loading punctuation model... Please wait.")

model = PunctuationModel()


r = sr.Recognizer()


with sr.Microphone() as source:
    print("\nAdjusting for ambient noise... Please wait.")
    
    r.adjust_for_ambient_noise(source, duration=1)
    
    print("Say something!")
    
    audio = r.listen(source)
    
    print("Recognizing...")
    
    
    try:
        
        raw_text = r.recognize_google(audio)
        
        
        punctuated_text = model.restore_punctuation(raw_text)
        
        
        print("\nYou said: " + punctuated_text)
    
    
    except sr.UnknownValueError:
        print("Sorry, the speech recognition service could not understand the audio.")
        
    
    except sr.RequestError as e:
        print(f"Could not request results from the speech recognition service; {e}")