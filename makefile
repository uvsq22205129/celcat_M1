all:
	javac -cp ./lib/json-20251224.jar:. JsonToCours.java Calandar.java Cours.java CelcatToJson.java Group.java Main.java

clean :
	rm *.class

run :
	java -cp ./lib/json-20251224.jar:. Main