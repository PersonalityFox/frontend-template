/**
 * Выполнять функцию не чаще заданного интервала
 * @param {Function} func
 * @param {number=100} threshold
 * @returns {Function}
 */
export default function throttle(
	func: ( ...rest: any[] ) => any,
	threshold: number = 100
): ( ...rest: any[] ) => any
{
	var timerId: number;
	var lastExecutionTime: number;
	
	return function throttled( ...rest: any[] ): void
	{
		var currentTime: number;
		
		currentTime = Date.now();
		
		if ( lastExecutionTime
			&& ( currentTime < lastExecutionTime + threshold ) )
		{
			clearTimeout( timerId );
			timerId = setTimeout(
				() =>
				{
					lastExecutionTime = currentTime;
					func.apply( this, rest );
				},
				threshold
			);
		}
		else
		{
			lastExecutionTime = currentTime;
			func.apply( this, rest );
		}
	}
}
