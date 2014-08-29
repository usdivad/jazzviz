<?php
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');
    $timelog = fopen('./timelog.txt', 'a');
    fwrite($timelog, 'Whoa FAIL!'." on ".date(DATE_RFC2822).PHP_EOL);
    fclose($timelog);

    exit();
?>