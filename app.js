// Change the dot count
const dotCount = 99

// init global elements
const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
canvas.width = window.innerWidth
canvas.height = window.innerHeight
let pointsRange = Math.min(window.innerWidth, window.innerHeight)
baseDotRadius = (pointsRange > 300) ? 3 : 1.5
const maxLineDistance = pointsRange / 2

let xcenter = ctx.canvas.width / 2
let ycenter = (ctx.canvas.height / 2)
let dots = []
let alpha = 0
let beta = 0
let gamma = 0
let betaScrollAddition = 0
let gammaScrollAddition = 0
let timedAngleAddition = 0

// Helper function
const randomRange = (min, max) => Math.random() * (max - min) + min;

// Dot class 
function Dot (x = null, y = null, z = null) {
    this.radius = baseDotRadius,
    this.opacity = 1,
    this.position = { 
        x : x || randomRange(-pointsRange, pointsRange),
        y : y || randomRange(-pointsRange, pointsRange),
        z : z || randomRange(-pointsRange, pointsRange),
    }
    this.initialPosition = {
        x: this.position.x, 
        y: this.position.y,
        z: this.position.z
    }
}

Dot.prototype.update = function() {
    // z-position
    let one = this.initialPosition.x * -Math.sin(beta);
    let two = this.initialPosition.y * Math.cos(beta) * Math.sin(gamma);
    let three = this.initialPosition.z * Math.cos(beta) * Math.cos(gamma);
    this.position.z = one + two + three;

    // Depth of field variables based on z-position
    let zPercentage = this.position.z / pointsRange;
    this.radius = baseDotRadius + ((baseDotRadius / 2) * zPercentage)
    this.opacity = 0.6 + ((zPercentage + 1) / 4);
    let depthOfFieldMultiplier = ((zPercentage + 1) / 2) + 0.5;

    // x position
    one = this.initialPosition.x * Math.cos(alpha) * Math.cos(beta);
    two = this.initialPosition.y * ((Math.cos(alpha) * Math.sin(beta) * Math.sin(gamma)) - (Math.sin(alpha) * Math.cos(gamma)));

    three = this.initialPosition.z * ((Math.cos(alpha) * Math.sin(beta) * Math.cos(gamma)) + (Math.sin(alpha) * Math.sin(gamma)))

    this.position.x = (one + two + three) * depthOfFieldMultiplier;

    // y position
    one = this.initialPosition.x * Math.sin(alpha) * Math.cos(beta)
    two = this.initialPosition.y * ((Math.sin(alpha) * Math.sin(beta) * Math.sin(gamma)) + (Math.cos(alpha) * Math.cos(gamma)))
    three = this.initialPosition.z * ((Math.sin(alpha) * Math.sin(beta) * Math.cos(gamma)) - (Math.cos(alpha) * Math.sin(gamma)))
    this.position.y = (one + two + three) * depthOfFieldMultiplier;
}

const render = () => {
    timedAngleAddition += 0.22 * Math.PI / 180
    beta = timedAngleAddition + betaScrollAddition
    gamma = timedAngleAddition + gammaScrollAddition

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    //draw dots
    dots.forEach((dot, index) => {

        // update dot position and radius
        dot.update();

        ctx.translate(xcenter + dot.position.x, ycenter + dot.position.y)

        // draw lines
        for (let i = index; i < dots.length; i++) {

            // distance formula to get distance to points
            let distance = Math.sqrt(Math.pow(dots[i].position.x - dot.position.x, 2) + Math.pow(dots[i].position.y - dot.position.y, 2) + Math.pow(dots[i].position.z - dot.position.z, 2))
            if (distance < maxLineDistance) {
                // use the distance to effect the opacity
                ctx.lineWidth = 1
                ctx.strokeStyle = 'rgba(100, 100, 100, ' + ((1 - (distance / maxLineDistance)) / 2) + ')'
                ctx.beginPath()
                ctx.moveTo(0, 0)
                ctx.lineTo(dots[i].position.x - dot.position.x, dots[i].position.y - dot.position.y)
                ctx.stroke()
            }
        }
        
        // draw dots
        ctx.fillStyle = 'rgba(90, 200, 35, ' + dot.opacity + ')'
        ctx.beginPath()
        ctx.arc(0, 0, dot.radius, 0, 2 * Math.PI)
        ctx.fill()
    
    // reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    })

    // loop to draw indefinitely
    window.requestAnimationFrame(render)
}
    
// mouse move listener

document.body.addEventListener('mousemove', (e) => {
        let rect = e.target.getBoundingClientRect()
        let percentageX = (e.clientX - rect.left) / document.body.clientWidth
        let percentageY = (e.clientY - rect.top) / document.body.clientHeight

        betaScrollAddition = (percentageX * 2 * Math.PI) - Math.PI
        gammaScrollAddition = -(percentageY * 2 * Math.PI) - Math.PI
})

// resize listener 

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    pointsRange = Math.min(window.innerWidth, window.innerHeight)
})
    
// create the starting dots
for (let i = 0; i < dotCount; i++) {
    dots.push(new Dot())
}
// start animation
render()