proper_ang = (big) ->
	tmp = 0
	if big > 0
		tmp = big / 360.0
		tmp = (tmp - (~~tmp)) * 360.0
	else
		tmp = Math.ceil(Math.abs(big / 360.0))
		tmp = big + tmp * 360.0

	tmp

Date.prototype.getJulian = ()->
	month = @.getMonth()
	day = @.getDate()
	year = @.getFullYear()
	zone = @.getTimezoneOffset() / 1440

	mm = month
	dd = day
	yy = year

	yyy = yy
	mmm = mm
	if mm < 3
		yyy = yyy - 1
		mmm = mm + 12

	day = dd + zone + 0.5
	a = ~~( yyy / 100 )
	b = 2 - a + ~~( a / 4 )
	jd = ~~( 365.25 * yyy ) + ~~( 30.6001 * ( mmm+ 1 ) ) + day + 1720994.5
	jd + b if jd > 2299160.4999999

Date.prototype.moonElong = ()->
	jd = @.getJulian()
	dr    = Math.PI / 180
	rd    = 1 / dr
	meeDT = Math.pow((jd - 2382148), 2) / (41048480 * 86400)
	meeT  = (jd + meeDT - 2451545.0) / 36525
	meeT2 = Math.pow(meeT, 2)
	meeT3 = Math.pow(meeT, 3)
	meeD  = 297.85 + (445267.1115 * meeT) - (0.0016300 * meeT2) + (meeT3 / 545868)
	meeD  = (proper_ang meeD) * dr
	meeM1 = 134.96 + (477198.8676 * meeT) + (0.0089970 * meeT2) + (meeT3 / 69699)
	meeM1 = (proper_ang meeM1) * dr
	meeM  = 357.53 + (35999.0503 * meeT)
	meeM  = (proper_ang meeM) * dr

	elong = meeD * rd + 6.29 * Math.sin( meeM1 )
	elong = elong     - 2.10 * Math.sin( meeM )
	elong = elong     + 1.27 * Math.sin( 2*meeD - meeM1 )
	elong = elong     + 0.66 * Math.sin( 2*meeD )
	elong = proper_ang elong
	elong = Math.round elong

	moonNum = ( ( elong + 6.43 ) / 360 ) * 28
	moonNum = ~~( moonNum )

	if moonNum is 28 then 0 else moonNum

moon_day = (today)->

	GetFrac = (fr)->
		return fr - Math.floor(fr)

	thisJD 	= today.getJulian()
	year 	= today.getFullYear()

	degToRad = 3.14159265 / 180

	K0 = Math.floor((year - 1900) * 12.3685)
	T = (year - 1899.5) / 100
	T2 = T * T
	T3 = T * T * T
	J0 = 2415020 + 29 * K0
	F0 = 0.0001178 * T2 - 0.000000155 * T3 + (0.75933 + 0.53058868 * K0) - (0.000837 * T + 0.000335 * T2)
	M0 = 360 * (GetFrac(K0 * 0.08084821133)) + 359.2242 - 0.0000333 * T2 - 0.00000347 * T3
	M1 = 360 * (GetFrac(K0 * 0.07171366128)) + 306.0253 + 0.0107306 * T2 + 0.00001236 * T3
	B1 = 360 * (GetFrac(K0 * 0.08519585128)) + 21.2964 - (0.0016528 * T2) - (0.00000239 * T3)

	phase = 0
	jday = 0

	while (jday < thisJD)
		F = F0 + 1.530588 * phase
		M5 = (M0 + phase * 29.10535608) * degToRad
		M6 = (M1 + phase * 385.81691806) * degToRad
		B6 = (B1 + phase * 390.67050646) * degToRad
		F -= 0.4068 * Math.sin(M6) + (0.1734 - 0.000393 * T) * Math.sin(M5)
		F += 0.0161 * Math.sin(2 * M6) + 0.0104 * Math.sin(2 * B6)
		F -= 0.0074 * Math.sin(M5 - M6) - 0.0051 * Math.sin(M5 + M6)
		F += 0.0021 * Math.sin(2 * M5) + 0.0010 * Math.sin(2 * B6 - M6)
		F += 0.5 / 1440
		oldJ = jday
		jday = J0 + 28 * phase + Math.floor(F)
		phase++

	# 29.53059 days per lunar month
	# return float from 0 to 1, where
	# both are the new moon and 0.5
	# is the full moon
	return (((thisJD - oldJ) / 29.53059))

draw_moon = (phase)->

	sweep = []
	mag
	full_moon
	phase_moon_name


	if phase <= 0.25
		sweep = [ 1, 0 ]
		mag = 20 - 20 * phase * 4
	else if phase <= 0.50
		sweep = [ 0, 0 ]
		mag = 20 * (phase - 0.25) * 4
	else if phase <= 0.75
		sweep = [ 1, 1 ]
		mag = 20 - 20 * (phase - 0.50) * 4
	else if phase <= 1
		sweep = [ 0, 1 ];
		mag = 20 * (phase - 0.75) * 4
	else
		exit


	if phase <= 0.0625
		full_moon = "Nope"
		phase_moon_name = "dark moon"
	else if phase <= 0.1875
		full_moon = "Nope"
		phase_moon_name = "waning crescent moon"
	else if phase <= 0.3125
		full_moon = "Nope"
		phase_moon_name = "last quarter moon"
	else if phase <= 0.4375
		full_moon = "Nope"
		phase_moon_name = "waning gibbous moon"
	else if phase <= 0.5625
		full_moon = "Yep"
		phase_moon_name = "full moon"
	else if phase <= 0.6875
		full_moon = "Nope"
		phase_moon_name = "waxing gibbous moon"
	else if phase <= 0.8125
		full_moon = "Nope"
		phase_moon_name = "first quarter moon"
	else if phase <= 0.9375
		full_moon = "Nope"
		phase_moon_name = "waxing crescent moon"
	else if phase > 0.9375
		full_moon = "Nope"
		phase_moon_name = "new moon"


	full_moon_tag = document.getElementById("full_moon")
	full_moon_tag.innerText = full_moon

	phase_moon_name_tag = document.getElementById("moon_phase_name")
	phase_moon_name_tag.innerText = phase_moon_name

	svg = document.getElementById("moon")

	supportsSVG = ()->
		!!document.createElementNS and !!document.createElementNS('http://www.w3.org/2000/svg', "svg").createSVGRect


	if supportsSVG()

		d = "m88,0 "
		d = d + "a" + mag + ",20 0 1," + sweep[0] + " 0,174 "
		d = d + "a20,20 0 1," + sweep[1] + " 0,-174"

		xmlns = "http://www.w3.org/2000/svg"

		# Moon background
		back  = document.createElementNS(xmlns, 'path')
		back.setAttribute('class', 'moonback')
		back.setAttribute('d', "m88,0 a20,20 0 1,1 0,174 a20,20 0 1,1 0,-174")

		svg.appendChild(back);

		# Moon phase
		path = document.createElementNS(xmlns, 'path')
		path.setAttribute('class', 'moonfront')
		path.setAttribute('d', d);

		svg.appendChild(path);

$ ->
	d = new Date(2013, 6, 27)

	draw_moon( moon_day( d ) )

