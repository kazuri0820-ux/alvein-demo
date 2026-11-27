// Character art direction: Chief-approved Mio, second silhouette. See CLAUDE.md.
window.AlveinCharacterArt=(()=>{
 const image=new Image();
 image.src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAmCAYAAAAiEnDvAAAE5klEQVR4nK2WW2xVRRSGv5nZc26FUipFLGIpUChQ8ZqgxBveiEFDMJJI1KAJCV5ijA/GqESNl0hijGg0+GCMicZrJF5iIsiDFEGS4gN3hNbW0KblIlDKOfucvffM8qF6WlJ7UOP/NLMn659/rfnXzIZRcGPzdFl06UwZbf2cuOHKGeXgBQsbzkkU/N3HqZmxrJw9U8adZ+jWpXNuqoZPbpp2sUy7QKG9IC7GJw6M4oSH9T8fVACFvZ+JsZb0zKXlWD2cpGZczJHTRbQSHJpXV3ahjebImYTGibUS7vtCtLLgA4r7vpR8xyY5S8miefOk3ibYlMEA3p4iSKoZiB17jg6wbcM7iDiU0iCCF8GJoWnRiiElVaaECTTee8R4Epcin4B4SAUaXHFwRxF6enpJYrjq9kdQJT1EIl5QOLLG8/pzBzCJxRpN3nl+2PAmaIuIoBVMbW6hZeEDhHFMLhMMU5IyVFlFTiueer6ZtDYY7yhGCYQJghpMIwyZPX8Z3764nCfvmE/H4T6lAW66co40VgnVJqY3FM5EnpIHQTF5TJorbnsMIw4jEU2LH6UQJujAsnb91qHTmZmNmVvlefaR37mspsCSKSGX1EZMz0Uo7zg/ZZg8fwWbN/7Erg9fQIxn7qo31P4jx1TZbIsnFmiojdDTPQ/dfApHiIszdP6WpqE3S5XO0FPI0rZtN2s/2MimdU9zy4Orpft4qADUnvvHyZy3F9L+cCvrDzryJc3OM1nGpmDHyYT6XMCXKwqs3XkpDsElns1t7fSrmN2HjysAPefdVbx2ayvPbDd83WP55GianacjTJDDiabrTMLl6yweSASyKUM+l6VlUt2Q7UvfTxJ9QFjzcYY9/QEnSgn9UczV9dV8130SBO67toUtezs5UghZNLeRXDpN7CJ2HD/Kd62HVNmx+dVZOfj7GA73pfmmM0UcGA71x+Ai6uomMKt+PGklYAxWKeIoIrbwyuc/qnIXV70UKgjLEpc0T5eth7rUmqW3SME6QFAKlIAo4YPt7dy9oGlkAw7HVwc6FEDeOrQCg0ZEMCK8t3kPGWv4YltHZRKAp+9aIBoh8Z5SHJMow/tb9lJdlSPyDoyj7JPR8GFbF9VJQlP9BOZOrOGTtnZmWcO9kwxBwfDEqT9PpxLJ6juvk1zaEiUxn7d1kS+WsEYTxxG5jKU/dvT0HlOjpvPyPbeKUZpi5Fi3eR9hMcQgpK3l3aYaoljIZbKVazJQLHA68BivsV5AFJmURVxCKIJozTWBH70mq5dfL309A2z6pZuUDcimLDPOn4BRwrGTA4zHoxCW1Vlaowvkb0k+be3ASYJSg5dVEFiODeSJo4iXG7JsL8TgPSihqi47Mp3mxkY51NOtXOLQaAIboJWmGHvQBquEt3ojUBqnPbt2/KpGKDnQ2akAUtk0aWUQoFAKsSZAAYHSZIzGec9HfYXKhVXOYJQnXwwxaFLG4kQIY4dzHgEO6prKJMYKOzsPq66+o8qJA+3xIjzelaC1or2nV0U6qUyCHxpqxlIoJdTqcYjW+HAwbPf+ropmPQvzmhrLj/q0KZNGPPAVG/AvRKWkYsA/Igns8Ml//2UpY+KEsf8Dy3/BjCmTpWX2RQIwdcqF0jC59t8XNmPSFE8M3mClWKFGmvzcJMViRDprAMgqsD5g1oyLzlLzBwDFL34xlinRAAAAAElFTkSuQmCC";
 function render(canvas,person){
   canvas.width=32;canvas.height=40;
   const ctx=canvas.getContext('2d');
   if(!image.naturalWidth)return;
   ctx.imageSmoothingEnabled=false;
   let seed=person.appearanceSeed;
   if(!Number.isInteger(seed)){
     seed=2166136261;
     for(const ch of [person.id,person.name,person.origin,person.signature].join('|'))seed=Math.imul(seed^ch.charCodeAt(0),16777619)>>>0;
   }
   const edge=['#b79871','#c18c64','#a0a599','#c8aa8d'][(seed>>>4)%4];
   ctx.fillStyle=edge;
   const x=23+(seed%2);
   if(person.role===0){
     for(let i=0;i<12;i++)ctx.fillRect(x+(i>>1),22-i,2,2);
     ctx.fillRect(x-2,22,5,1);
   }else if(person.role===2){
     for(let i=0;i<18;i++)ctx.fillRect(x+Math.round(4*Math.sin(i*Math.PI/17)),12+i,1,2);
     ctx.fillRect(x,12,1,18);
   }else if(person.role===1){
     ctx.fillRect(x+1,13,1,17);ctx.fillRect(x,11,3,3);
   }
   ctx.drawImage(image,Math.floor((32-image.width)/2),39-image.height);
   if(person.role!==3){ctx.fillStyle=edge;ctx.fillRect(17,23,2,1)}
 }
 return Object.freeze({render,ready:callback=>{if(image.complete&&image.naturalWidth)callback();else image.addEventListener('load',callback,{once:true})}});
})();
