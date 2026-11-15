console.log("Bonjour le monde !" );
alert("Bonjour le monde !");
//alert("n'entrez pas votre nom");
/*var nom = prompt("Quel est votre nom ?");
console.log("Bonjour " + nom + " !");
var confirmation = confirm("Vous etes d'accord ?");*/
// NaN
console.log(0 / 0) ;
console.log('Some random string' * 2) ;

// Infini
console.log(1 / 0) ;
console.log(Infinity * Infinity) ;
console.log(1e+309) ;

var num = 0 ;
console.log(num)
num ++
console.log(num)
num --
console.log(num)

// Example 1: (Classic Function Declaration)
function cube(n){    
return n*n*n; 
}
// Example 2: (Function Expression)
var cube = function(n){    
return n*n*n; 
}
console.log(cube(3)); // returns 27

var add = function(a=5, b=3) {
    return a + b;
};
console.log(add()); // returns 8
console.log(add(10, 20)); // returns 30


var numbers = [19, 65, 1, 2, 6, 1, 9, 9, 2, 1] ;

var sum = 0 ;
var i = 0 ;
while ( i <  numbers.length ) {
    sum += numbers[i] ;
    console.log("number de i ") ;
    console.log(numbers[i]) ;
    console.log(sum) ;
    i += 1 ;
    console.log(i) ;
}
console.log('La boucle a été exécutée ' + i + ' fois') ;
// imprime La boucle a été exécutée 10 fois

console.log(sum) 