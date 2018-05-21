/**
 * Test class
 */

import trottle from '../lib/throttle';

/// <reference path="../definitelyTyped/jquery.d.ts" />

const ACTIVE: string = 'active';
const SHOW: string = 'show';
const LIGHTBOX: string = 'lightbox';

declare let $: any;

export default class HTMLElement
{
	private body: HTMLBodyElement;

	public constructor( body: HTMLBodyElement )
	{
		this.body = body;

		this.startClassSuccess('PPA');
	}

	private startClassSuccess( str: string ): void
	{
		console.log( str );
	}
}


