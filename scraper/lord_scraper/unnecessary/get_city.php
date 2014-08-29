<?php
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Headers: Origin, X-Requested-With, Content-Type, Accept');

	//$data = $_POST['data'];

	//JSON
	/*
	$json = stripslashes($data);
	$arr = json_decode($json, true);
	var_dump($arr);
	$n = $arr["a"];
	echo $n;
	*/



	//Text
	$filename = './cities_slave.txt';
	$file = file($filename);
	$line = $file[0];

	//time/log stuff

	$timelog = fopen('./timelog.txt', 'a');
	fwrite($timelog, "Sleep before getting ".rTrim($line)." on ".date(DATE_RFC2822).PHP_EOL);

	//Actions
	//take current city attempt and put it at the bottom; prevents "reloading" pages
	unset($file[0]); 
	array_push($file, $line);
	if (!empty($line)) {
		echo $line;
		file_put_contents($filename, $file);
	}
	else {
		echo "empty!";
		file_put_contents($filename, file('./cities_master.txt'));
		fwrite($timelog, '--Reset cities_slave.txt on '.date(DATE_RFC2822).'!--'.PHP_EOL);
	}


	fclose($timelog);

	exit();
?>