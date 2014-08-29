cd usdivad/results
f='../../dates.json'
echo '[' > $f
for i in $(ls);
do
    cat $i >> $f
    echo ',' >> $f
    echo $i
done
#manually remove last comma..
echo ']' >> $f