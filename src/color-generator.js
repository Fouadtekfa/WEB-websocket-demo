import isDef from './is-def'

var colors = ['red', 'orange', 'yellow', 'blue', 'green', 'cyan', 'magenta', 'grey', 'coral', 'brown', 'pink', 'chocolate', 'fireBrick', 'fuchsia', 'gold', 'lime', 'salmon', 'navy', 'teal'];
export default (random) => {
    random = isDef(random) ? random : Math.random;
    return  colors[Math.floor(Math.random() * colors.length)]
}
