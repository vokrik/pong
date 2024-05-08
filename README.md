# Particle pong

## Demo
https://663b4bee798529f319e36856--astounding-sunflower-4fff3a.netlify.app/

## Installation 

To start playing the game, you can simply open the `dist/index.html` file in your browser

If you want to run development build, you can simply run


`npm install && npm start` 

in the folder where you unpacked the .zip file.

## How to play

Player movement is controlled by up/down arrow key

Your goal is to reach 3 points.

To start over, please refresh the page. 


## Notable features
* Particle effects on ball & mouse (initial screen)
* Camera shake on score
* Transitions between screens

## Notes
It's been some time since I worked on the 2D graphics, so it took me some time to refresh the linear algebra knowledge.
That is why I have multiple representations of vector logic (vx, vy, vector, speed & direction etc.). Ideally I would love to refactor this
to use only one system of how to record positions and directions.

I wanted to use the opportunity to experiment a little bit with the xstate library (I saw some colleagues working with it and it looked quite interesting), 
however I realised that it does not play super well with the OOP approach (right now the state is somewhat 
weirdly in the objects and in the xstate). If I had more time, I would probably just drop the xstate.

There definitely is a space for some abstraction around game objects. I was thinking about refactoring it, but then I rather spent the time 
implementing the transition effects.

I had some big ambitions to make the paddles destructible, so that the longer you played, the smaller it would get.
Also I wanted to create a "power" move and "shield". The power move would throw the ball faster, but it would chip off bigger part of your paddle.
The shield would protect you from chipping, but it would prevent you from moving for a while. Anyway, I would need waaay more time for that :D 

