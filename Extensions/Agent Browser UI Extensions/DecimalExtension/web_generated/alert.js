/// <reference path="../libs/jquery/index.d.ts"/>
$(() => {
    const urlToParse = new URL(window.location.href);
    const alertMessage = urlToParse.searchParams.get('alertMessage');
    $('#alertMessage').html(alertMessage);
});
