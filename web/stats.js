import { renderMatchHistory } from "./profile.js";

export function drawAxes() {
    const svg = document.getElementById('Graph');
    let axisLength = 100;
    const axes = [
        { x: 0, y: -axisLength }, // Top
        { x: axisLength, y: 0 },  // Right
        { x: 0, y: axisLength },  // Bottom
        { x: -axisLength, y: 0 }  // Left
    ];

    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', 100);
    line.setAttribute('y1', 0);
    line.setAttribute('x2', 100);
    line.setAttribute('y2', 200);
    line.setAttribute('class', 'axis');
    line.setAttribute('strokeWidth', 2);
    line.setAttribute('stroke', '#657483');
    svg.appendChild(line);

    let line2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line2.setAttribute('x1', 0);
    line2.setAttribute('y1', 100);
    line2.setAttribute('x2', 200);
    line2.setAttribute('y2', 100);
    line2.setAttribute('class', 'axis');
    line2.setAttribute('strokeWidth', 2);
    line2.setAttribute('stroke', '#657483');
    svg.appendChild(line2);
}

export function calcoords(wins, scored, losses, suffered, axs)
{
	const centerX = 100;
	const centerY = 100;
	const axisLength = 100;
	const globalMaxSum = 80;

	const axes = [
		{ x: 0, y: -axisLength }, // Top
		{ x: axisLength, y: 0 },  // Right
		{ x: 0, y: axisLength },  // Bottom
		{ x: -axisLength, y: 0 }  // Left
	];

	function drawPoint(a, b, c, d) {
		const sum = a + b + c + d;
		if (sum === 0) return { x: centerX, y: centerY };

		const normA = (a / sum) * (sum / globalMaxSum);
		const normB = (b / sum) * (sum / globalMaxSum);
		const normC = (c / sum) * (sum / globalMaxSum);
		const normD = (d / sum) * (sum / globalMaxSum);

		const x = centerX +
			normA * axes[0].x +
			normB * axes[1].x +
			normC * axes[2].x +
			normD * axes[3].x;

		const y = centerY +
			normA * axes[0].y +
			normB * axes[1].y +
			normC * axes[2].y +
			normD * axes[3].y;

		return { x, y };
	}

	if (axs)
		drawAxes();

	const p1 = drawPoint(wins, 0, 0, 0);
	const p2 = drawPoint(0, scored, 0, 0);
	const p3 = drawPoint(0, 0, losses, 0);
	const p4 = drawPoint(0, 0, 0, suffered);

	let polygon = document.getElementById("chart");
	polygon.setAttribute("points", "");

	let mline = document.getElementById("line");
	mline.setAttribute('x1', centerX);
	mline.setAttribute('y1', centerY);
	mline.setAttribute('x2', centerX);
	mline.setAttribute('y2', centerY);

	const allPoints = [p1, p2, p3, p4].filter(p => p);
	if (scored <= 0 && losses <= 0 && suffered <= 0)
    {
        mline.setAttribute('x2', centerX)
        mline.setAttribute('y2', p1.y)
    }
    else if (wins <= 0 && losses <= 0 && suffered <= 0)
    {
        mline.setAttribute('x2', p2.x)
        mline.setAttribute('y2', centerY)
    }
    else if (wins <= 0 && scored <= 0 && suffered <= 0)
    {
        mline.setAttribute('x2', centerX)
        mline.setAttribute('y2', p3.y)
    }
    else if (wins <= 0 && scored <= 0 && losses <= 0)
    {
        mline.setAttribute('x2', p4.x)
        mline.setAttribute('y2', centerY)
    }
    else
        polygon.setAttribute('points', "" + p1.x + "," + p1.y + " " + p2.x + "," + p2.y + " " + p3.x + "," + p3.y + " " + p4.x + "," + p4.y + "")    
}


export function adjust(axs)
{
	const winners = document.querySelectorAll(".allWinners")
	let adjWins = 0
	let adjScored = 0
	let adjLosses = 0
	let adjSuffered = 0
	let checkboxes = document.querySelectorAll(".allRows")
	for (let i = 0; i < checkboxes.length; i++)
	{
		if (!(checkboxes[i].checked))
			continue
		if (winners[i].innerText === document.getElementById('userNameDisplay').innerText)
			adjWins++
		else if (winners[i].innerText === "Draw")
			adjDraws++
		else
			adjLosses++
        adjScored += parseInt(checkboxes[i].parentElement.parentElement.children[2].children[0].children[0].innerHTML)
        adjSuffered += parseInt(checkboxes[i].parentElement.parentElement.children[2].children[0].children[2].innerHTML)
	}
	document.getElementById("wins").innerHTML = adjWins
	document.getElementById("scored").innerHTML = adjScored
	document.getElementById("lost").innerHTML = adjLosses
	document.getElementById("suffered").innerHTML = adjSuffered
	calcoords(adjWins, adjScored, adjLosses, adjSuffered, axs)
}


export function showOpts(elem)
{
	if (elem.children[1].classList.contains("d-none"))
		elem.children[1].classList.remove("d-none")
}

export function hideOpts(elem)
{
	if (!elem.children[1].classList.contains("d-none"))
		elem.children[1].classList.add("d-none")
}

export function toggleGraph(elem, col, add)
{
	const allTrs = document.querySelectorAll("tbody>tr")
	const parentTr = elem.closest('tr')

	let allLines
	if (col === 1)
		allLines = document.querySelectorAll(".allOpponents")
	else if (col === 3)
		allLines = document.querySelectorAll(".allWinners")
	for (let i = 0; i < allTrs.length; i++)
	{
		if (!(allTrs[i].children[0].children[0].checked))
			allTrs[i].children[0].children[0].click()
	}
	if (add)
	{
		for (let i = 0; i < allLines.length; i++)
		{
			if (allLines[i].innerText !== parentTr.children[col].children[0].innerText)
				allTrs[i].children[0].children[0].click()
		}
	}
	else
	{
		for (let i = 0; i < allLines.length; i++)
		{
			if (allLines[i].innerText === parentTr.children[col].children[0].innerText)
				allTrs[i].children[0].children[0].click()
		}
	}
    adjust(0);
}

async function	getUserData(userID)
{
	let response = await fetch(`management/management/user/${userID}/`);

	return (await response.json() );
}

export async function renderToggableGraph(data, userID, elem)
{
    let dest = document.querySelector("#" + elem);
    if (!dest)
        return;
    let won = 0, lost = 0, scored = 0, suffered = 0;
	for (const entry of data) {
        let id = entry.player1;
        let winner = await getUserData(entry.winner);
        let p1_score = 0;
        let p2_score = 0;
        if (entry.player1 !== userID)
        {
            id = entry.player2;
            scored += entry.p2_score;
            suffered += entry.p1_score;
            p1_score = entry.p2_score;
            p2_score = entry.p1_score;
        }
        else
        {
            scored += entry.p1_score;
            suffered += entry.p2_score;
            p1_score = entry.p1_score;
            p2_score = entry.p2_score;
        }

        let resultColor = "light";
        if (entry.winner === userID) {
            resultColor = "success";
            won++;
        } else
        {
           resultColor = "danger";
            lost++;
        }

        let opponent = await getUserData(id);

        const date = new Date(entry.ended_at);
        const formattedDate = date.toLocaleString();
        let row = `
        <tr>
            <td class="col"><input onchange="adjust(0)" class="allRows" type="checkbox" checked name="graph"></td>
            <td onmouseenter="showOpts(this)" onmouseleave="hideOpts(this)" class="col">
                <span class="allOpponents pe-none">${opponent.username}</span>
                <span class="position-relative graph-select d-none">
                    <span class="position-absolute">
                        <div class="d-flex flex-column">
                            <div onclick="toggleGraph(this, 1, true)" class="p-0 m-0 graph-opts pointer w-100 h-100 rounded-circle">=</div>
                            <div onclick="toggleGraph(this, 1, false)" class="p-0 m-0 graph-opts pointer w-100 h-100 rounded-circle">≠</div>
                        </div>
                    </span>
                </span>
            </td>
            <td class="col text-${resultColor}">
            
            <!--
            <span class="pe-none">${p1_score} <strong class="fw-bolder">-</strong> ${p2_score}</span>

            -->
                <div class="pe-none">
                    <span id="userpoints">${p1_score}</span>
                    <span> - </span>
                    <span id="opponentpoints">${p2_score}</span>
                </div>
            </td>
            <td onmouseenter="showOpts(this)" onmouseleave="hideOpts(this)" class="col">
                <span class="allWinners pe-none">${winner.username}</span>
                <span class="position-relative graph-select d-none">
                    <span class="position-absolute">
                        <div class="d-flex flex-column">
                            <div onclick="toggleGraph(this, 3, true)" class="p-0 m-0 graph-opts pointer w-100 h-100 rounded-circle">=</div>
                            <div onclick="toggleGraph(this, 3, false)" class="p-0 m-0 graph-opts pointer w-100 h-100 rounded-circle">≠</div>
                        </div>
                    </span>
                </span>
            </td>
            </tr>
        `;

        dest.innerHTML += row;
	}

	if (document.querySelector("#wins"))
		document.querySelector("#wins").innerHTML = won;
    if (document.querySelector("#lost"))
		document.querySelector("#lost").innerHTML = lost;
    if (document.querySelector("#scored"))
        document.querySelector("#scored").innerHTML = scored;
    if (document.querySelector("#suffered"))
        document.querySelector("#suffered").innerHTML = suffered;
    adjust(0);
}


export async function renderStats()
{
    let mainContainer = document.getElementById("viewRow");
	try
	{
		let response = await fetch("views/stats.html");

		if (!response.ok)
			throw new Error("Error loading stats");

		let statsHtml = await response.text();
		mainContainer.innerHTML = statsHtml;

        drawAxes();
        await renderMatchHistory(null, true)
	}
	catch (error)
	{
		mainContainer.innerHTML = `<p>${error}</p>`;
	}
}