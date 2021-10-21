import React from 'react'


class ConsoleLog extends React.Component {


	render () {
		<ScrollView 
		nestedScrollEnabled
		style={{
				backgroundColor: 'gray',
				flex: 1,
				paddingVertical: 10,
				minHeight: 200,
				maxHeight: 200,
		}}
		ref={scrollViewRef}
		onContentSizeChange={() => {scrollViewRef.current.scrollToEnd({ animated: true})}}
		>
			<View
			style={{
				backgroundColor: 'gray',
			}}>
				<View>
					{bluetoothLog.map((obj) => {return (<Text>{obj}</Text>)})}
				</View>
			</View>
		</ScrollView>
	}
}