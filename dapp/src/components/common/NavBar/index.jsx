import React, { Component } from 'react'
import Logo from 'components/common/Logo'
import HelpIcon from 'images/help.svg'
import NotificationIcon from 'images/notification.svg'
import WalletIcon from 'images/fuse-wallet.svg'
import classNames from 'classnames'
import ProfileDropDown from './../ProfileDropDown'
import { isMobileOnly } from 'react-device-detect'
import { withRouter } from 'react-router-dom'
import { withNetwork } from 'containers/Web3'
import capitalize from 'lodash/capitalize'

class NavBar extends Component {
  state = {
    scrollTop: 0,
    isHelpOpen: false,
    isProfileOpen: false,
    isNotificationOpen: false
  }
  componentDidMount () {
    document.addEventListener('scroll', this.handleScroll)
    document.addEventListener('click', this.handleClickOutside)
  }

  componentWillUnmount () {
    document.removeEventListener('scroll', this.handleScroll)
    document.removeEventListener('click', this.handleClickOutside)
  }

  handleScroll = (event) => {
    let lastScrollY = window.scrollY
    this.setState({ scrollTop: lastScrollY })
  }

  handleClickOutside = (event) => {
    if (this.dropdownHelpRef && !this.dropdownHelpRef.contains(event.target)) {
      this.setState({ isHelpOpen: false })
    }

    if (this.dropdownProfile && !this.dropdownProfile.contains(event.target)) {
      this.setState({ isProfileOpen: false })
    }
  }

  setDropdownHelpRef = (node) => {
    this.dropdownHelpRef = node
  }

  setDropdownProfileRef = (node) => {
    this.dropdownProfile = node
  }

  goToHome = () => {
    const { history } = this.props

    history.push('/')
  }

  render () {
    const { withLogo, networkType } = this.props
    const { isHelpOpen, isProfileOpen } = this.state
    return (
      <div className={classNames('navbar', { 'navbar--scroll': this.state.scrollTop > 70 })} style={{ width: (this.state.scrollTop > 70 && !isMobileOnly) && !withLogo ? '80%' : null }}>
        { (withLogo || (isMobileOnly && this.state.scrollTop > 70)) && <div className='navbar__logo'><Logo onClick={this.goToHome} isBlue={this.state.scrollTop < 70} /></div> }
        <div className='navbar__links' style={{ marginLeft: !withLogo ? 'auto' : null }}>
          <div
            className='navbar__links__help'
            ref={this.setDropdownHelpRef}
            onClick={(e) => {
              e.stopPropagation()
              this.setState({ isHelpOpen: !isHelpOpen })
            }}
          >
            <span className='icon'><img src={HelpIcon} /></span>
            <div className={classNames('drop', { 'drop--show': isHelpOpen })}>
              <ul className='drop__options'>
                <li className='drop__options__item'><a href='' target='_blank'>FAQ</a></li>
                <li className='drop__options__item'><a href='https://github.com/ColuLocalNetwork' target='_blank'>Github</a></li>
                <li className='drop__options__item'>Contact us</li>
              </ul>
            </div>
          </div>
          <div className='navbar__links__notification'>
            <span className='icon'><img src={NotificationIcon} /></span>
          </div>
          <div
            className='navbar__links__wallet'
            ref={this.setDropdownProfileRef}
            onClick={(e) => {
              e.stopPropagation()
              this.setState({ isProfileOpen: !isProfileOpen })
            }}
          >
            <span className='icon'><img src={WalletIcon} /></span>
            <span className='navbar__links__wallet__text'>{capitalize(networkType)} network</span>
            <div className={classNames('drop drop--profile', { 'drop--show': isProfileOpen })}>
              <ProfileDropDown />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

NavBar.defaultProps = {
  withLogo: true
}

export default withRouter(withNetwork(NavBar))
