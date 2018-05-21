import TestClass from '../classes/TestClass';

export default function init(): void
{
	let testElement: HTMLBodyElement;

    testElement = <HTMLBodyElement>document.querySelector('body');
	
	new TestClass(testElement);
}