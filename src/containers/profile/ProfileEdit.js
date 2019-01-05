import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  TextInput,
  Alert,
  PermissionsAndroid
} from 'react-native'
import { Actions } from 'react-native-router-flux'
import { Toast } from 'antd-mobile'

import ImagePicker from 'react-native-image-picker'

import TextPingFang from '../../components/TextPingFang'
import Container from '../../components/Container'
import ProfileHeader from './components/ProfileHeader'

import store from '../../redux/store'
import { fetchProfileSuccess, cleanUser } from '../../redux/modules/user'
import { cleanPartner } from '../../redux/modules/partner'

import {
  getResponsiveWidth,
} from '../../common/styles'
import Storage from '../../common/storage'
import { setToken } from '../../network/HttpUtils'
import { SCENE_LOGIN_OPTIONS } from '../../constants/scene'

import { updateUser, postImgToQiniu } from '../../common/util'

export default class ProfileEdit extends Component {

  state = {
    user: {},
    name: ''
  }

  componentDidMount() {
    this.setState({ user: this.props.user, name: this.props.user.name })
  }

  async _checkPermission(){
    try {
      const results = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
      ])
      if(results[PermissionsAndroid.PERMISSIONS.CAMERA] === PermissionsAndroid.RESULTS.GRANTED &&
        results[PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED &&
        results[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] === PermissionsAndroid.RESULTS.GRANTED){
          this.seleceFace()
        } else {
          Toast.info('双生需要获取权限才能添加图片哦', 2)
        }
    } catch (err) {
      Toast.info('双生获取权限失败了T_T', 2)
    }
  }

  async seleceFace() {
    const options = {
      title: '',
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '拍摄',
      chooseFromLibraryButtonTitle: '从相册选择',
      cameraType: 'back',
      mediaType: 'photo',
      maxWidth: 375,
      maxHeight: 282,
      quality: 1,
      allowsEditing: true,
      storageOptions: {
        skipBackup: true,
        cameraRoll: true,
        waitUntilSaved: true
      }
    }
    ImagePicker.showImagePicker(options, async res => {
      if (!res.didCancel) {
        const images = await postImgToQiniu([res.uri], { type: 'profile', user_id: this.state.user.id })
        this.setState({ user: Object.assign({}, this.state.user, { face: images }) }, () => {
          this.updateUser()
        })
      }
    })
  }

  async updateUser() {
    const data = {
      name: this.state.name,
      face: this.state.user.face
    }
    try {
      const res = await updateUser(this.state.user, data)
      if (res.code === 0) {
        store.dispatch(fetchProfileSuccess(res.data.user))
        Toast.success('修改成功')
      }else {
        Toast.fail('出错了，等会再试试')
      }
    } catch (e) {
      Toast.fail('出错了，等会再试试')
    }
  }

  _logout() {
    Alert.alert('确定要退出登录吗?', '', [
      {
        text: '取消'
      },
      {
        text: '确定',
        onPress: async () => {
          store.dispatch(cleanUser())
          store.dispatch(cleanPartner())
          await Storage.remove('key')
          setToken({
            uid: '',
            token: '',
            timestamp: ''
          })
          Actions.reset(SCENE_LOGIN_OPTIONS)
        }
      }
    ])
  }

  // TODO: 缺少获取徽章接口
  render() {
    return (
      <Container>
        <View>
          <ProfileHeader title='个人信息' />

          <ScrollView scrollEnabled={true} contentContainerStyle={styles.main_container}>
            <TouchableOpacity
              style={styles.row}
              onPress={() => {
                if ( Platform.OS === 'ios' ){
                  this.seleceFace()
                }else{
                  this._checkPermission()
                }
              }}
            >
              <TextPingFang style={styles.text_row_left}>头像</TextPingFang>
              <Image style={styles.row_face} source={{ uri: this.state.user.face }} />
              <Image style={styles.row_indicator} source={require('../../../res/images/common/icon_indicator.png')} />
            </TouchableOpacity>

            <View
              style={styles.row}
            >
              <TextPingFang style={styles.text_row_left}>昵称</TextPingFang>
              <TextInput
                ref={ref => this.name_ipt = ref}
                style={styles.text_row_right}
                value={this.state.name}
                maxLength={48}
                underlineColorAndroid='transparent'
                returnKeyType='done'
                enablesReturnKeyAutomatically
                onChangeText={name => {
                  //if(Platform.OS === 'ios'){
                      //  this.setState({ name })
                  // }else{
                  //   let user = this.state.user
                  //   user.name = name
                     this.setState({name:name})
                  // }
                }}
                onSubmitEditing={() => this.updateUser()}
                //onBlur={()=>this.updateUser()}
              />
              <TouchableOpacity
                style={styles.row_indicator}
                onPress={() => this.name_ipt.focus()}
              >
                <Image source={require('../../../res/images/profile/icon_edit.png')} />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <TextPingFang style={styles.text_row_left}>ID</TextPingFang>
              <TextPingFang style={styles.text_row_right}>{this.props.user.code}</TextPingFang>
            </View>

            {/* <View style={styles.badge}>
             <TextPingFang style={styles.text_badge_title}>展示徽章</TextPingFang>
             {
             (() => {
             if (!this.props.user.badges) {
             return <TextPingFang style={styles.text_badge_content}>你还没有获得任何徽章</TextPingFang>
             } else {
             // TODO: 缺少获取徽章接口
             }
             })()
             }
             </View> */}
          </ScrollView>

          <TouchableOpacity style={styles.btn} onPress={() => this._logout()}>
            <TextPingFang style={styles.text_btn}>退出登录</TextPingFang>
          </TouchableOpacity>
        </View>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  main_container: {
    paddingLeft: getResponsiveWidth(24),
    paddingRight: getResponsiveWidth(24),
  },
  row: {
    height: getResponsiveWidth(64),
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f1f1'
  },
  text_row_left: {
    color: '#000',
    fontSize: 16,
    fontWeight: '300'
  },
  text_row_right: {
    width: 200,
    position: 'absolute',
    left: getResponsiveWidth(40),
    marginLeft: getResponsiveWidth(16),
    color: '#000',
    fontSize: 20,
    fontWeight: '300',
  },
  row_face: {
    width: getResponsiveWidth(48),
    height: getResponsiveWidth(48),
    marginLeft: getResponsiveWidth(16),
    borderRadius: getResponsiveWidth(24)
  },
  row_indicator: {
    position: 'absolute',
    right: 0
  },
  badge: {
    marginTop: getResponsiveWidth(56)
  },
  text_badge_title: {
    color: '#000',
    fontSize: 20,
    fontWeight: 'bold'
  },
  text_badge_content: {
    marginTop: getResponsiveWidth(16),
    color: '#000',
    fontSize: 16
  },
  btn: {
    position: 'absolute',
    left: getResponsiveWidth(24),
    bottom: getResponsiveWidth(80),
    height: getResponsiveWidth(48),
    justifyContent: 'center',
    alignItems: 'center',
  },
  text_btn: {
    color: '#f00',
    fontSize: 20,
    fontWeight: '300'
  }
})
