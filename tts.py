import pyttsx3


engine = pyttsx3.init()


my_text = "I am Sreenith.Happy to run this program."


engine.setProperty('rate', 150)  

engine.say(my_text)

engine.runAndWait()

print("Offline speech finished.")