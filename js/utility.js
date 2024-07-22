function createXHR()
{
	try
	{
		var XHR = new XMLHttpRequest();
	}
	catch(e1)
	{
		try
		{
			var XHR = new ActiveXObject('Msxml2.XMLHTTP');
		}
		catch(e2)
		{
			try
			{
				var XHR = new ActiveXObject('Microsoft.XMLHTTP');
			}
			catch(e3)
			{
				XHR = false;
			}
		}
	}
	return XHR;
}