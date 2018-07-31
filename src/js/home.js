UserProfile = {
	kWhBarChart: null,
	storagePieChart: null,
	balanceLineChart: null,

	render: async function(){
		let instance = await App.contracts.Energy.at(App.contractAddress);
	    let currentKwh = await instance.getPossessedkWh(App.userAccount);
	    $("#balanceKwh").text(currentKwh);
	    web3.eth.getBalance(App.userAccount, function(error, result){
	        if(!error)
	            $("#balanceEth").text(result);
	        else
	            console.error("Errore durante la richiesta dell'user balance "+error);
	    });
	    UserProfile.initChart();
	    
	    /* Commentare codice sottostante per eliminare i valori demo */
	    UserProfile.updateKwhBarChartData([5, 15, 14, 20, 27, 45, 10, 5, 7, 10, 74, 21], [35, 72, 3, 17, 10, 12, 44, 10, 19, 20, 77, 66]);
	    UserProfile.updateStoragePieChartData(['Primo storage','Secondo storage','Altri'], [10, 20, 30]);
	    UserProfile.updateBalanceLineChartData([5, 10, 15, 20, 10, 5, 10],[10, 20, 15, 5, 15, 20, 10]);
	},

	updateKwhBarChartData: function(buyed, sold){
		kWhBarChart.data.datasets[0].data = buyed;
		kWhBarChart.data.datasets[1].data = sold;
		kWhBarChart.update();
	},

	updateStoragePieChartData: function(labels, values){
		storagePieChart.data.labels = labels;
		storagePieChart.data.datasets[0].data = values;
		storagePieChart.update();
	},

	updateBalanceLineChartData: function(earned, spent){
		balanceLineChart.data.datasets[0].data = earned;
		balanceLineChart.data.datasets[1].data = spent;
		balanceLineChart.update();
	},

	initChart: function() {
		var ctx = document.getElementById("kWhBarChart").getContext('2d');
		kWhBarChart = new Chart(ctx, {
		    type: 'bar',
		    data: {
        		labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		        datasets: [{
		            label: 'Buyed',
		            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		            backgroundColor: 'rgba(99, 255, 132, 0.2)',
		            borderColor: 'rgba(99,255,132,1)',
		            borderWidth: 1
		        },
		        {
		            label: 'Sold',
		            data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
		            backgroundColor: 'rgba(255, 99, 132, 0.2)',
		            borderColor: 'rgba(255,99,132,1)',
		            borderWidth: 1
		        }]
		    },
		    options: {
		    	legend: {
		            display: true,
		            position: 'top'
        		},	
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true
		                }
		            }]
		        },
		        layout: {
		        	padding: {
		        		left: 0,
		        		right: 0,
		        		top: 0,
		        		bottom: 250
		        	}
		        }
		    }
		});

		var ctx = document.getElementById("storagePieChart").getContext('2d');
		storagePieChart = new Chart(ctx, {
		    type: 'pie',
		    data: {
        		labels: [
				        'Red',
				        'Yellow',
				        'Blue'
				    ],
				datasets: [{
			        data: [0, 0, 0],
				    backgroundColor: ['rgba(99,255,132,0.7)','rgba(249,99,50,0.7)','rgba(255,25,25,0.7)'],
				    borderColor: ['rgba(255,255,255,1)','rgba(255,255,255,1)','rgba(255,255,255,1)'],
				    hoverBackgroundColor: ['rgba(99,255,132,0.8)','rgba(249,99,50,0.8)','rgba(255,25,25,0.8)'],
				    hoverBorderColor: []
			    }],
		    },
		    options: {
		        layout: {
		        	padding: {
		        		left: 0,
		        		right: 0,
		        		top: 0,
		        		bottom: 0
		        	}
		        },
		        cutoutPercentage: 40
		    }
		});

		var ctx = document.getElementById("balanceLineChart").getContext('2d');
		balanceLineChart = new Chart(ctx, {
		    type: 'line',
		    data: {
				labels: ['Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
				datasets: [{
					label: 'Earned',
					backgroundColor: 'rgba(99,255,132,0.8)',
					borderColor: 'rgba(99,255,132,0.6)',
					data: [0, 0, 0, 0, 0, 0, 0],
				cubicInterpolationMode: 'monotone',
				lineTension: 0,
				fill: false
				}, {
					label: 'Spent',
					backgroundColor: 'rgba(255,25,25,0.8)',
					borderColor: 'rgba(255,25,25,0.6)',
					data: [0, 0, 0, 0, 0, 0, 0],
				cubicInterpolationMode: 'monotone',
				lineTension: 0,
				fill: false
				}]
		    },
		    options: {
		        scales: {
		            yAxes: [{
		                ticks: {
		                    beginAtZero:true
		                }
		            }]
		        }
		    }
		});
	}
};