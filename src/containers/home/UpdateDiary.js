import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  TextInput,
  Alert,
  BackHandler,
  TouchableOpacity,
  Image,
  Animated,
  DatePickerIOS,
  Platform,
} from 'react-native'
import DatePicker from 'react-native-datepicker'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { connect } from 'react-redux'
import { Actions } from 'react-native-router-flux'

import Container from '../../components/Container'
import TextPingFang from '../../components/TextPingFang'
import DiaryBanner from './DiaryBanner'

import {
  WIDTH,
  HEIGHT,
  getResponsiveWidth,
} from '../../common/styles'
import {
  formatDate,
  downloadImg,
  updateFile,
  syncFile
} from '../../common/util'
import { SCENE_INDEX } from '../../constants/scene'

function mapStateToProps(state) {
  return {
    user: state.user,
  }
}

@connect(mapStateToProps)
export default class UpdateDiary extends Component {

  state = {
    date: new Date(),
    title: '',
    title_2: '', //解决TextInput 无法输入中文
    content: '',
    content_2: '',
    showPopup: false,
    imgPathList: [],
    oldImgPathList: [],
    savingDiary: false,
    leftButton: null,
    datePickerY: new Animated.Value(-220),
    showDatePicker: false
  }

  componentWillMount() {
    BackHandler.addEventListener('hardwareBackPress', this.onBackAndroid);
    const diary = this.props.diary
    this.setState({
      date: new Date(diary.date),
      title: diary.title,
      title_2: diary.title,
      content: diary.content,
      content_2: diary.content,
      imgPathList: diary.imgPathList,
      oldImgPathList: [...diary.imgPathList],
    }, () => this._renderLeftButton())
  }
  onBackAndroid = () => {
    this.saveDiary()
    return true;
  };


  componentWillUnmount() {
    this.saveDiary()
    BackHandler.removeEventListener('hardwareBackPress', this.onBackAndroid);
  }


  async saveDiary() {
    const isLogin = !!this.props.user.id

    // if (this.state.savingDiary) return

    // this.setState({savingDiary: true})

    const { title_2, content_2, imgPathList, date } = this.state
    let title = title_2, content = content_2
    if (!title && !content) return

    // 过滤已存在的图片
    let newImgPathList = [] // 新的未缓存图片
    let oldUseingImgPathList = [] // 更新日记继续使用的已缓存图片
    for (let i = 0; i < imgPathList.length; i++) {
      for (let j = 0; j < this.state.oldImgPathList.length; j++) {
        if (imgPathList[i] === this.state.oldImgPathList[j]) {
          oldUseingImgPathList.push(imgPathList[i])
          break
        }
        if (j === this.state.oldImgPathList.length - 1) {
          newImgPathList.push(imgPathList[i])
        }
      }
    }
    if (!this.state.oldImgPathList.length) {
      newImgPathList = imgPathList
    }
    // 复制图片文件
    let newPathListPromises = newImgPathList.map(async path => {
      return await downloadImg(path, this.props.user.id)
    })
    let newUsingImgPathList = []
    for (let newPathListPromise of newPathListPromises) {
      newUsingImgPathList.push(await newPathListPromise)
    }

    // 更新配置文件
    await updateFile({
      user_id: this.props.user.id || 0,
      action: 'update',
      data: {
        ...this.props.diary,
        title,
        content,
        date: date.getTime(),
        imgPathList: [...newUsingImgPathList, ...oldUseingImgPathList],
        op: this.props.diary.id ? 2 : 1
      }
    })

    isLogin && syncFile(this.props.user.id)

    Actions.pop()
  }

  getImgPathList(imgPathList) {
    this.setState({ imgPathList })
    this._renderLeftButton()
  }

  _renderLeftButton() {
    let source = this.state.imgPathList.length ?
      require('../../../res/images/home/diary/icon_back_white.png') :
      require('../../../res/images/home/diary/icon_back_black.png')

    const leftButton = (
      <TouchableOpacity onPress={() => Actions.pop()}>
        <Image source={source} />
      </TouchableOpacity>
    )

    this.setState({ leftButton })
  }

  _selectDate() {
    this.setState({ showDatePicker: !this.state.showDatePicker }, () => {
      Animated.spring(
        this.state.datePickerY,
        {
          toValue: this.state.showDatePicker ? 0 : -220,
          duration: 300
        }
      ).start()
    })
  }

  render() {
    return (
      <Container hidePadding={true}>
        {
          Platform.OS == 'ios' ?
            <Animated.View
              style={{
                position: 'absolute',
                bottom: this.state.datePickerY,
                backgroundColor: '#fff',
                zIndex: 100
              }}
            >
              <DatePickerIOS
                locale={'zh-Hans'}
                style={styles.date_picker}
                date={this.state.date}
                maximumDate={new Date()}
                mode={'datetime'}
                onDateChange={date => this.setState({ date })}
              />
            </Animated.View>
            : null
        }

        {
          Platform.OS == 'ios' ?
            <TouchableOpacity
              style={[styles.mask, { display: this.state.showDatePicker ? 'flex' : 'none' }]}
              onPress={() => this._selectDate()}
            >
            </TouchableOpacity>
            : null
        }

        <KeyboardAwareScrollView
          contentContainerStyle={styles.scroll_style}
          extraScrollHeight={0}
          enableResetScrollToCoords
        >
          <DiaryBanner
            showNav={true}
            showBanner={true}
            showBottomBar={true}
            leftButton={this.state.leftButton}
            onPressBack={() => Actions.pop()}
            imgPathList={this.state.imgPathList}
            getImgPathList={this.getImgPathList.bind(this)}
          />

          {
            Platform.OS == 'ios' ?
              <View style={styles.date_container}>
                <TextPingFang style={styles.text_date}>{formatDate(this.state.date, 'Z月 dd, yyyy')}</TextPingFang>
                <TouchableOpacity
                  style={styles.small_calendar}
                  onPress={this._selectDate.bind(this)}
                >
                  <Image source={require('../../../res/images/home/diary/icon_calendar_small.png')} />
                </TouchableOpacity>
              </View>
              : <View style={styles.date_container}>
                <DatePicker
                  style={{ width: 200 }}
                  date={this.state.date}
                  mode="date"
                  format="MM-DD，YYYY"
                  maxDate={new Date()}
                  confirmBtnText="确定"
                  cancelBtnText="取消"
                  iconSource={require('../../../res/images/home/diary/icon_calendar_small.png')}
                  customStyles={{
                    dateIcon: {
                      position: 'absolute',
                      left: getResponsiveWidth(90),
                      top: 10,
                      bottom: 10,
                      marginLeft: 0,
                      width: getResponsiveWidth(20),
                      height: getResponsiveWidth(20)
                    },
                    dateInput: {
                      marginLeft: 0,
                      borderWidth: 0,
                      alignItems: 'flex-start',
                      justifyContent: 'center'
                    }
                  }}
                  onDateChange={(date, date1) => {
                    this.setState({ date: date1 })
                  }
                  }
                />
              </View>
          }

          {/* Android下，因为TextInput的value设的是title,而onChangeText的时候修改的是title_2,所以会导致在安卓下输入的时候，看到的效果是输入一个字符后又立刻被删除，虽然输入的内容已经被存在title_2了 */}
          <TextInput
            style={styles.text_title}
            value={this.state.title}
            underlineColorAndroid='transparent'
            onChangeText={title =>  {
                if(Platform.OS=='ios'){
                  this.setState({ title_2: title })
                }else {
                  this.setState({ title_2: title, title : title })
                }
              }
            }
            onBlur={() => this.setState({ title: this.state.title_2 })}
            placeholder='标题'
            placeholderTextColor='#aaa'
          />

          <TextInput
            style={styles.text_content}
            value={this.state.content}
            underlineColorAndroid='transparent'
            onChangeText={content => {
                if(Platform.OS=='ios'){
                  this.setState({ content_2: content })
                }else {
                  this.setState({ content_2: content , content : content })
                }
              }
            }
            onBlur={() => this.setState({ content: this.state.content_2 })}
            placeholder='请输入正文'
            placeholderTextColor='#aaa'
            multiline
          />

        </KeyboardAwareScrollView>

      </Container>
    )
  }
}

const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    width: WIDTH,
    height: HEIGHT,
    zIndex: 10
  },
  date_picker: {
    width: WIDTH,
  },
  date_container: {
    width: WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: getResponsiveWidth(24),
    paddingTop: getResponsiveWidth(24),
    paddingBottom: getResponsiveWidth(24),
  },
  scroll_style: {
    // height: HEIGHT,
    // backgroundColor: 'red'
  },
  text_date: {
    color: '#aaa',
    fontSize: 12
  },
  small_calendar: {
    marginLeft: getResponsiveWidth(8)
  },
  text_title: {
    color: '#333',
    fontSize: 20,
    fontWeight: '500',
    paddingLeft: getResponsiveWidth(24),
    paddingRight: getResponsiveWidth(24),
    paddingTop: getResponsiveWidth(48),
  },
  text_content: {
    color: '#666',
    fontSize: 16,
    paddingLeft: getResponsiveWidth(24),
    paddingRight: getResponsiveWidth(24),
    marginTop: getResponsiveWidth(12),
    paddingBottom: getResponsiveWidth(24),
  }
})
